// lnb 고정 + 스크롤스파이 + 부드러운 스크롤
(() => {
    const lnb = document.querySelector('nav.lnb');
    if (!lnb) return;
  
    const links = Array.from(lnb.querySelectorAll('a[href^="#"]'));
    const sections = links
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
  
    // 활성 링크 토글
    const setActive = (id) => {
      links.forEach(a => {
        const on = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('is-active', on);
      });
    };
  
    // 부드러운 스크롤 (lnb 높이 보정)
    const scrollToSection = (el) => {
      const lnbH = lnb.offsetHeight || 0;
      const y = el.getBoundingClientRect().top + window.scrollY - lnbH - 4; // 살짝 여유
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
  
    // 클릭 이동
    links.forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        scrollToSection(target);
      });
    });
  
    // 섹션 관찰(스크롤스파이) – lnb 높이만큼 위 여백 보정
    const makeSectionObserver = () => {
      const lnbH = lnb.offsetHeight || 0;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id) setActive(id);
          }
        });
      }, {
        root: null,
        // 상단에 lnb가 가리는 만큼 위 마진, 아래는 넉넉히
        rootMargin: `-${lnbH + 1}px 0px -80% 0px`,
        threshold: 0
      });
  
      sections.forEach(sec => observer.observe(sec));
    };
    makeSectionObserver();
  
    // lnb 고정 상태 감지(그림자 효과용)
    // lnb 바로 위에 감시용 센티넬 삽입
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.height = '0';
    sentinel.style.width = '0';
    sentinel.setAttribute('aria-hidden', 'true');
    lnb.parentNode.insertBefore(sentinel, lnb);
  
    const stickyWatcher = new IntersectionObserver(([entry]) => {
      // sentinel이 화면에서 사라지면 lnb가 상단에 달라붙은 상태
      lnb.classList.toggle('is-stuck', entry.intersectionRatio === 0);
    }, { threshold: [0, 1] });
    stickyWatcher.observe(sentinel);
  
    // 최초 로딩 시 현재 위치에 맞춰 활성화
    const initActive = () => {
      const lnbH = lnb.offsetHeight || 0;
      let currentId = null;
      sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top - lnbH - 4;
        if (top <= 0) currentId = sec.id; // 지나온 섹션 중 가장 아래 = 현재
      });
      if (!currentId && sections[0]) currentId = sections[0].id;
      if (currentId) setActive(currentId);
    };
    window.addEventListener('load', initActive);
    window.addEventListener('resize', initActive); // 반응형에서 lnb 높이 변동 고려
  })();
  