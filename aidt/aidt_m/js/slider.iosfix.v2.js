// js/slider.iosfix.v2.js
// - iOS Safari 스와이프 고정(축 잠금 + passive:false + preventDefault)
// - 한 장(뷰포트) 폭 기준 픽셀 계산으로 드래그 반영
// - 여러 슬라이더(.slider_wrap) 동시 지원
(function () {
  function initSlider(wrapper) {
    const slidesEl = wrapper.querySelector(".slides");
    if (!slidesEl) return;

    const slideEls = wrapper.querySelectorAll(".slide");
    const indicatorsEl = wrapper.querySelector(".indicators");
    let indicatorEls = wrapper.querySelectorAll(".indicator");

    const prevBtn = wrapper.querySelector(".nav-button.prev");
    const nextBtn = wrapper.querySelector(".nav-button.next");

    const loop = (wrapper.dataset.loop || "false").toLowerCase() === "true";
    let current = 0;
    const lastIndex = slideEls.length - 1;

    // 인디케이터 자동 생성(없을 때)
    if (!indicatorEls.length && indicatorsEl) {
      indicatorsEl.innerHTML = "";
      slideEls.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.className = "indicator" + (i === 0 ? " current" : "");
        indicatorsEl.appendChild(dot);
      });
      indicatorEls = wrapper.querySelectorAll(".indicator");
    }

    function setDisabledState(btn, disabled) {
      if (!btn) return;
      btn.disabled = disabled;
      btn.classList.toggle("is-disabled", disabled);
      const imgs = btn.querySelectorAll("img");
      imgs.forEach((img) => {
        if (img.classList.contains("disabled")) {
          img.style.display = disabled ? "" : "none";
        } else {
          img.style.display = disabled ? "none" : "";
        }
      });
    }

    function update(withTransition = true) {
      slidesEl.style.transition = withTransition ? "transform 500ms ease" : "none";
      slidesEl.style.transform = `translateX(-${current * 100}%)`;
      indicatorEls.forEach((el, i) => {
        el.classList.toggle("current", i === current);
      });
      if (!loop) {
        setDisabledState(prevBtn, current === 0);
        setDisabledState(nextBtn, current === lastIndex);
      } else {
        setDisabledState(prevBtn, false);
        setDisabledState(nextBtn, false);
      }
    }

    function goTo(index) {
      if (loop) {
        current = (index + slideEls.length) % slideEls.length;
      } else {
        current = Math.max(0, Math.min(index, lastIndex));
      }
      update(true);
    }

    // 클릭(버튼/인디케이터)
    prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));
    indicatorEls.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    // ----- 스와이프/드래그 (iOS Safari 대응) -----
    let pointerActive = false;
    let startX = 0, startY = 0;
    let deltaX = 0;
    let locked = null; // 'x' | 'y' | null

    const thresholdRatio = 0.15; // 한 장 폭의 15% 이상 이동 시 전환
    const maxDeltaRatio = 0.35;  // 드래그 중 시각적 최대 이동 비율

    // 한 장(뷰포트) 폭
    const getSlideWidth = () => wrapper.getBoundingClientRect().width;

    // 현재 슬라이드 위치 + 드래그 오프셋(px) 반영
    function translateWithOffset(offsetPx) {
      const W = getSlideWidth();
      const base = -current * W;
      slidesEl.style.transition = "none";
      slidesEl.style.transform = `translate3d(${base + offsetPx}px, 0, 0)`;
    }

    function onPointerDown(x, y) {
      pointerActive = true;
      startX = x;
      startY = y ?? 0;
      deltaX = 0;
      locked = null;
      slidesEl.style.willChange = "transform";
      slidesEl.classList.add("is-dragging");
    }

    function onPointerMove(x, y, e) {
      if (!pointerActive) return;
      const dx = x - startX;
      const dy = (y ?? 0) - startY;

      // 축 잠금: 처음 의미 있는 이동에서 수평/수직 결정
      if (locked == null && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
        locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (locked === "y") {
        // 수직 스크롤 우선: 드래그 취소
        pointerActive = false;
        slidesEl.classList.remove("is-dragging");
        update(true);
        return;
      }

      // iOS: 수평 제스처에서는 스크롤/바운스 방지
      if (e && e.cancelable) e.preventDefault();

      const W = getSlideWidth();
      deltaX = dx;

      // 양끝 저항감
      let effectiveDelta = deltaX;
      if (!loop) {
        const atFirst = current === 0 && deltaX > 0;
        const atLast  = current === lastIndex && deltaX < 0;
        if (atFirst || atLast) effectiveDelta *= 0.35;
      }

      // 이동 한계
      const maxDelta = W * maxDeltaRatio;
      if (effectiveDelta >  maxDelta) effectiveDelta =  maxDelta;
      if (effectiveDelta < -maxDelta) effectiveDelta = -maxDelta;

      translateWithOffset(effectiveDelta);
    }

    function onPointerUp() {
      if (!pointerActive) return;
      pointerActive = false;
      slidesEl.style.willChange = "auto";
      slidesEl.classList.remove("is-dragging");

      const W = getSlideWidth();
      const movedRatio = Math.abs(deltaX) / W;

      if (movedRatio >= thresholdRatio) {
        goTo(deltaX < 0 ? current + 1 : current - 1);
      } else {
        update(true); // 원위치
      }
      deltaX = 0;
      locked = null;
    }

    // 이벤트 등록 — passive:false (iOS에서 preventDefault 가능하도록)
    slidesEl.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      onPointerDown(e.clientX, e.clientY);
      if (slidesEl.setPointerCapture) slidesEl.setPointerCapture(e.pointerId);
    }, { passive: false });

    slidesEl.addEventListener("pointermove", (e) => {
      if (!pointerActive) return;
      onPointerMove(e.clientX, e.clientY, e);
    }, { passive: false });

    slidesEl.addEventListener("pointerup", onPointerUp, { passive: false });
    slidesEl.addEventListener("pointercancel", onPointerUp, { passive: false });

    // 터치(구형 Safari 포함)
    slidesEl.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches[0]) return;
      const t = e.touches[0];
      onPointerDown(t.clientX, t.clientY);
    }, { passive: false });

    slidesEl.addEventListener("touchmove", (e) => {
      if (!pointerActive || !e.touches || !e.touches[0]) return;
      const t = e.touches[0];
      onPointerMove(t.clientX, t.clientY, e);
    }, { passive: false });

    slidesEl.addEventListener("touchend", onPointerUp, { passive: false });
    slidesEl.addEventListener("touchcancel", onPointerUp, { passive: false });

    // 이미지 드래그 방지
    slidesEl.addEventListener("dragstart", (e) => e.preventDefault());

    // 초기 스타일(가로 배치)
    slidesEl.style.display = "flex";
    slidesEl.style.transition = "transform 500ms ease";
    slideEls.forEach((s) => {
      s.style.minWidth = "100%";
      s.style.flex = "0 0 100%";
      s.style.userSelect = "none";
      s.style.webkitUserSelect = "none";
      s.style.touchAction = "pan-y"; // 수직 스크롤 허용
    });
    slidesEl.style.touchAction = "pan-y";

    update(true);

    // 리사이즈 시 현재 위치 재계산
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => update(true), 100);
    });
  }

  function initAll() {
    const wrappers = document.querySelectorAll(".slider_wrap");
    wrappers.forEach(initSlider);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  window.reinitSliders = initAll;
})();