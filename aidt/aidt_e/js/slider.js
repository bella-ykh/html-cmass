// js/slider.js (iOS Safari 호환 개선: touch 우선, pointer/touch 중복 방지, capture 제거)
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

    // 인디케이터 자동 생성
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
      indicatorEls.forEach((el, i) => el.classList.toggle("current", i === current));
      if (!loop) {
        setDisabledState(prevBtn, current === 0);
        setDisabledState(nextBtn, current === lastIndex);
      } else {
        setDisabledState(prevBtn, false);
        setDisabledState(nextBtn, false);
      }
    }

    function goTo(index) {
      if (loop) current = (index + slideEls.length) % slideEls.length;
      else current = Math.max(0, Math.min(index, lastIndex));
      update(true);
    }

    // 버튼/인디케이터
    prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));
    indicatorEls.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    // ----- 입력 통합 (iOS: touch만, 그 외: pointer 우선) -----
    const isIOS = /iP(ad|hone|od)/i.test(navigator.userAgent);
    const usePointer = !isIOS && "PointerEvent" in window;

    let pointerActive = false;
    let startX = 0;
    let deltaX = 0;

    const thresholdRatio = 0.15; // 15% 이상 이동 시 페이지 전환
    const maxDeltaRatio = 0.35;  // 드래그 중 이동 한계

    function translateWithOffset(offsetPx) {
      const containerWidth = slidesEl.getBoundingClientRect().width;
      const base = -current * containerWidth;
      slidesEl.style.transition = "none";
      slidesEl.style.transform = `translateX(${base + offsetPx}px)`;
    }

    function onStart(x) {
      pointerActive = true;
      startX = x;
      deltaX = 0;
      slidesEl.style.willChange = "transform";
      slidesEl.classList.add("is-dragging");
    }

    function onMove(x) {
      if (!pointerActive) return;
      const containerWidth = slidesEl.getBoundingClientRect().width;
      let moving = x - startX;

      // 루프 아닐 때 끝단 저항
      if (!loop) {
        const atFirst = current === 0 && moving > 0;
        const atLast = current === lastIndex && moving < 0;
        if (atFirst || atLast) moving *= 0.35;
      }

      // 이동 한계
      const maxDelta = containerWidth * maxDeltaRatio;
      if (moving > maxDelta) moving = maxDelta;
      if (moving < -maxDelta) moving = -maxDelta;

      deltaX = moving;
      translateWithOffset(moving);
    }

    function onEnd() {
      if (!pointerActive) return;
      pointerActive = false;
      slidesEl.style.willChange = "auto";
      slidesEl.classList.remove("is-dragging");

      const containerWidth = slidesEl.getBoundingClientRect().width;
      const movedRatio = Math.abs(deltaX) / containerWidth;

      if (movedRatio >= thresholdRatio) {
        if (deltaX < 0) goTo(current + 1);
        else goTo(current - 1);
      } else {
        update(true);
      }
      deltaX = 0;
    }

    // 이벤트 바인딩
    if (usePointer) {
      // 마우스/펜/터치 통합(pointer 사용)
      slidesEl.addEventListener(
        "pointerdown",
        (e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return; // 좌클릭만
          onStart(e.clientX);
          // iOS 충돌 방지 위해 pointer capture 사용 안 함:contentReference[oaicite:3]{index=3}
          // slidesEl.setPointerCapture && slidesEl.setPointerCapture(e.pointerId);
        },
        { passive: true }
      );

      slidesEl.addEventListener(
        "pointermove",
        (e) => {
          if (!pointerActive) return;
          onMove(e.clientX);
        },
        { passive: true }
      );

      slidesEl.addEventListener("pointerup", onEnd, { passive: true });
      slidesEl.addEventListener("pointercancel", onEnd, { passive: true });
    } else {
      // iOS: touch만 사용 (pointer와 중복 방지):contentReference[oaicite:4]{index=4}
      slidesEl.addEventListener(
        "touchstart",
        (e) => {
          if (!e.touches || !e.touches[0]) return;
          onStart(e.touches[0].clientX);
        },
        { passive: true }
      );

      slidesEl.addEventListener(
        "touchmove",
        (e) => {
          if (!pointerActive || !e.touches || !e.touches[0]) return;
          onMove(e.touches[0].clientX);
        },
        { passive: true }
      );

      slidesEl.addEventListener("touchend", onEnd, { passive: true });
      slidesEl.addEventListener("touchcancel", onEnd, { passive: true });
    }

    // 드래그 중 이미지 선택 방지
    slidesEl.addEventListener("dragstart", (e) => e.preventDefault());

    // 초기 스타일
    slidesEl.style.display = "flex";
    slidesEl.style.transition = "transform 500ms ease";
    slideEls.forEach((s) => {
      s.style.minWidth = "100%";
      s.style.flex = "0 0 100%";
      s.style.userSelect = "none";
      // iOS에서는 touch-action을 지정하지 않음(가로 스와이프 막힘 방지):contentReference[oaicite:5]{index=5}
      if (!isIOS) s.style.touchAction = "pan-y"; // 데스크톱/안드로이드: 수직 스크롤 우선
    });

    update(true);

    // 리사이즈 대응
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
