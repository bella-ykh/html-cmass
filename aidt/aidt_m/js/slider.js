// js/slider.js
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
  
      function update() {
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
        update();
      }
  
      // 이벤트 바인딩(슬라이더 범위 안에서만)
      prevBtn && prevBtn.addEventListener("click", () => goTo(current - 1));
      nextBtn && nextBtn.addEventListener("click", () => goTo(current + 1));
  
      indicatorEls.forEach((dot, i) => {
        dot.addEventListener("click", () => goTo(i));
      });
  
      // 초기화
      // 슬라이드 가로 배치용 스타일(필요 시 보정)
      slidesEl.style.display = "flex";
      slidesEl.style.transition = "transform 500ms ease";
      slideEls.forEach((s) => {
        s.style.minWidth = "100%";
        s.style.flex = "0 0 100%";
      });
  
      update();
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
  