// 수업 탭메뉴 
document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('.tabs .tab');
  const contents = document.querySelectorAll('.tab-content');

  if (!tabs.length || !contents.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // 모든 탭/콘텐츠에서 current 제거
      tabs.forEach((t) => t.classList.remove('current'));
      contents.forEach((c) => c.classList.remove('current'));

      // 클릭된 탭과 해당 콘텐츠에 current 추가
      tab.classList.add('current');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('current');
    });
  });
});


// 대시보드 탭 스크롤
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.content-panel');
  const menuWrap = document.querySelector('.menu_wrap');
  const wrapScroll = document.querySelector('.wrap_scroll');

  if (!tabs.length || !panels.length) return;

  // 탭 클릭: active 토글
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // 스크롤 시 메뉴 표시/숨김 (성능 최적화: rAF + passive)
  if (menuWrap && wrapScroll) {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const wrapBottom = wrapScroll.getBoundingClientRect().bottom;
          // wrap_scroll 섹션 하단이 화면 위로 올라가면 메뉴 숨김
          if (wrapBottom <= 0) {
            menuWrap.style.display = 'none';
          } else {
            // 레이아웃에 맞게 기본 display가 flex라면 flex로 복원
            menuWrap.style.display = 'flex';
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }
});
