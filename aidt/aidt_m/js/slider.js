
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
      slidesEl.style.transform = `translateX(-${current * 100}%)`;
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

    // ----- 스와이프/드래그 -----
    let pointerActive = false;
    let startX = 0;
    let lastX = 0;
    let deltaX = 0;
    const thresholdRatio = 0.15; // 컨테이너 폭의 15% 이상 이동 시 페이지 전환
    const maxDeltaRatio = 0.35;  // 드래그 중 이동 한계(시각적 저항)

    // 현재 슬라이드 위치 + 드래그 오프셋 적용
    function translateWithOffset(offsetPx) {
      const containerWidth = slidesEl.getBoundingClientRect().width;
      const base = -current * containerWidth;
      slidesEl.style.transition = "none";
      slidesEl.style.transform = `translateX(${base + offsetPx}px)`;
    }

    function onPointerDown(x) {
      pointerActive = true;
      startX = x;
      lastX = x;
      deltaX = 0;
      slidesEl.style.willChange = "transform";
      slidesEl.classList.add("is-dragging");
    }

    function onPointerMove(x) {
      if (!pointerActive) return;
      const containerWidth = slidesEl.getBoundingClientRect().width;
      deltaX = x - startX;

      // 루프가 아니면 양 끝에서 저항감 부여
      let effectiveDelta = deltaX;
      if (!loop) {
        const atFirst = current === 0 && deltaX > 0;
        const atLast = current === lastIndex && deltaX < 0;
        if (atFirst || atLast) {
          effectiveDelta *= 0.35;
        }
      }

      // 이동 한계
      const maxDelta = containerWidth * maxDeltaRatio;
      if (effectiveDelta > maxDelta) effectiveDelta = maxDelta;
      if (effectiveDelta < -maxDelta) effectiveDelta = -maxDelta;

      translateWithOffset(effectiveDelta);
      lastX = x;
    }

    function onPointerUp() {
      if (!pointerActive) return;
      pointerActive = false;
      slidesEl.style.willChange = "auto";
      slidesEl.classList.remove("is-dragging");

      const containerWidth = slidesEl.getBoundingClientRect().width;
      const movedRatio = Math.abs(deltaX) / containerWidth;

      if (movedRatio >= thresholdRatio) {
        if (deltaX < 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
      } else {
        // 원위치
        update(true);
      }
      deltaX = 0;
    }

    // 포인터/마우스
    slidesEl.addEventListener("pointerdown", (e) => {
      // 왼쪽 버튼만
      if (e.pointerType === "mouse" && e.button !== 0) return;
      onPointerDown(e.clientX);
      slidesEl.setPointerCapture && slidesEl.setPointerCapture(e.pointerId);
    }, { passive: true });

    slidesEl.addEventListener("pointermove", (e) => {
      if (!pointerActive) return;
      onPointerMove(e.clientX);
    }, { passive: true });

    slidesEl.addEventListener("pointerup", () => {
      onPointerUp();
    }, { passive: true });

    slidesEl.addEventListener("pointercancel", () => {
      onPointerUp();
    }, { passive: true });

    // 터치(사파리 구형 호환)
    slidesEl.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches[0]) return;
      onPointerDown(e.touches[0].clientX);
    }, { passive: true });

    slidesEl.addEventListener("touchmove", (e) => {
      if (!pointerActive || !e.touches || !e.touches[0]) return;
      onPointerMove(e.touches[0].clientX);
    }, { passive: true });

    slidesEl.addEventListener("touchend", () => {
      onPointerUp();
    }, { passive: true });

    // 드래그 중 이미지 선택 방지
    slidesEl.addEventListener("dragstart", (e) => e.preventDefault());

    // 초기화: 가로 배치
    slidesEl.style.display = "flex";
    slidesEl.style.transition = "transform 500ms ease";
    slideEls.forEach((s) => {
      s.style.minWidth = "100%";
      s.style.flex = "0 0 100%";
      s.style.userSelect = "none";
      s.style.touchAction = "pan-y"; // 수직 스크롤 우선, 수평 드래그 가능
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
