// /js/slider.js
export function initSlider(root, options = {}) {
    const {
      startIndex = 0,
      loop = false,            // 끝에서 다음/처음으로 순환할지
      onChange = null          // 슬라이드 변경 콜백 (선택)
    } = options;
  
    // 필수 엘리먼트 수집 (root는 .slider_wrap)
    const slidesTrack   = root.querySelector('.slides');
    const indicators    = root.querySelectorAll('.indicator');
    const prevButton    = root.querySelector('.prev');
    const nextButton    = root.querySelector('.next');
  
    if (!slidesTrack || indicators.length === 0 || !prevButton || !nextButton) {
      console.warn('[Slider] 필수 요소가 누락되었습니다.', { root });
      return;
    }
  
    const total = indicators.length;
    let current = Math.min(Math.max(0, startIndex), total - 1);
  
    function update(index) {
      current = index;
  
      // 이동
      slidesTrack.style.transform = `translateX(-${current * 100}%)`;
  
      // 인디케이터 상태
      indicators.forEach((el, i) => {
        el.classList.toggle('current', i === current);
        el.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
  
      // 버튼 활성/비활성
      if (!loop) {
        prevButton.disabled = current === 0;
        nextButton.disabled = current === total - 1;
      } else {
        prevButton.disabled = false;
        nextButton.disabled = false;
      }
  
      // (선택) 콜백
      if (typeof onChange === 'function') onChange(current);
    }
  
    function goPrev() {
      if (current > 0) return update(current - 1);
      if (loop) return update(total - 1);
    }
  
    function goNext() {
      if (current < total - 1) return update(current + 1);
      if (loop) return update(0);
    }
  
    // 이벤트 바인딩
    prevButton.addEventListener('click', goPrev);
    nextButton.addEventListener('click', goNext);
    indicators.forEach((indicator, i) => {
      indicator.addEventListener('click', () => update(i));
    });
  
    // 초기 상태 반영
    update(current);
  
    // 퍼블릭 API 반환 (필요시 외부에서 제어 가능)
    return {
      get index() { return current; },
      get length() { return total; },
      next: goNext,
      prev: goPrev,
      goTo: (i) => update(Math.min(Math.max(0, i), total - 1)),
      destroy() {
        prevButton.removeEventListener('click', goPrev);
        nextButton.removeEventListener('click', goNext);
        indicators.forEach((indicator) => {
          const clone = indicator.cloneNode(true);
          indicator.replaceWith(clone);
        });
      }
    };
  }
  