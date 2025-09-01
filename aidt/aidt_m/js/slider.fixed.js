
// js/slider.js (swipe + drag 지원)
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

    // 인디케이터가 없으면 자동 생성(옵션)
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
      // 버튼 내부의 '비활성 이미지' 토글
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
      const W = wrapper.getBoundingClientRect().width;
      slidesEl.style.transform = `translate3d(${-current * W}px,0,0)`;
      // 인디케이터 반영
      indicatorEls.forEach((el, i) => {
        el.classList.toggle("current", i === current);
      });

      // 루프가 아닐 때만 비활성 처리
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
        // 음수/초과를 순환
        current = (index + slideEls.length) % slideEls.length;
      } else {
        current = Math.max(0, Math.min(index, lastIndex));
      }
      update(true);
    }

    // ----- 클릭(버튼/인디케이터) -----
    prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));
    indicatorEls.forEach((dot, i) => {
      dot.addEventListener("click", () => goTo(i));
    });

        // ----- 스와이프/드래그 (iOS Safari fix) -----
    let pointerActive = false;
    let startX = 0, startY = 0;
    let deltaX = 0;
    let locked = null; // 'x' | 'y' | null
    const thresholdRatio = 0.15; // 한 장 폭의 15% 넘게 움직이면 전환
    const maxDeltaRatio = 0.35;  // 드래그 중 시각적 한계

    const getSlideWidth = () => wrapper.getBoundingClientRect().width;

    function translateWithOffset(offsetPx) {
      const W = getSlideWidth();
      const base = -current * W;
      slidesEl.style.transition = "none";
      slidesEl.style.transform = `translate3d(${base + offsetPx}px,0,0)`;
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

      if (locked == null && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
        locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (locked === "y") {
        pointerActive = false;
        slidesEl.classList.remove("is-dragging");
        update(true);
        return;
      }

      if (e && e.cancelable) e.preventDefault();

      const W = getSlideWidth();
      deltaX = dx;

      let effectiveDelta = deltaX;
      if (!loop) {
        const atFirst = current === 0 && deltaX > 0;
        const atLast  = current === lastIndex && deltaX < 0;
        if (atFirst || atLast) effectiveDelta *= 0.35;
      }

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
        update(true);
      }
      deltaX = 0;
      locked = null;
    }

    // Pointer Events
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

    // Touch Events (구형 Safari 호환)
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

    // 드래그 중 이미지 선택 방지
    slidesEl.addEventListener("dragstart", (e) => e.preventDefault());

    // 초기화: 가로 배치
    slidesEl.style.display = "flex";
    slidesEl.style.transition = "transform 500ms ease";
    slidesEl.style.touchAction = "pan-y";
    slideEls.forEach((s) => {
      s.style.minWidth = "100%";
      s.style.flex = "0 0 100%";
      s.style.userSelect = "none";
      
      s.style.webkitUserSelect = "none";
      s.style.touchAction = "pan-y";s.style.touchAction = "pan-y"; // 수직 스크롤 우선, 수평 드래그 가능
    });

    update(true);

    // 리사이즈 시 현재 위치 재계산(픽셀 기반 드래그 대비)
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

  // 필요하면 외부에서 재초기화 가능
  window.reinitSliders = initAll;
})();
