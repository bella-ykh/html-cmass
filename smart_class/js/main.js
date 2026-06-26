// GNB 스크롤스파이 & 메뉴 활성화
(function () {
  const gnb = document.querySelector('.gnb');
  const gnbLinks = document.querySelectorAll('.gnb__link');
  const sections = document.querySelectorAll('main section[id]');

  if (!gnb || !gnbLinks.length || !sections.length) return;

  // 메뉴 클릭 시: 클릭한 항목 즉시 활성화 (smooth scroll은 CSS scroll-behavior로 처리)
  gnbLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      gnbLinks.forEach(function (l) { l.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // 현재 보이는 섹션에 해당하는 메뉴 항목 활성화
  function updateActiveMenu() {
    var gnbHeight = gnb.offsetHeight;
    var currentId = '';

    // 섹션 상단이 GNB 하단 위치에 도달하면 현재 섹션으로 기록
    // (마지막으로 조건을 만족한 섹션 = 현재 보이는 섹션)
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= gnbHeight + 1) {
        currentId = section.getAttribute('id');
      }
    });

    // 아직 어떤 섹션도 GNB 위치에 오지 않은 경우 첫 번째 메뉴 활성화
    if (!currentId) {
      gnbLinks.forEach(function (l) { l.classList.remove('active'); });
      if (gnbLinks[0]) gnbLinks[0].classList.add('active');
      return;
    }

    // 현재 섹션에 해당하는 메뉴 항목만 active 처리
    gnbLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('active', isActive);
    });
  }

  // 스크롤 이벤트 등록 (passive: true로 성능 최적화)
  window.addEventListener('scroll', updateActiveMenu, { passive: true });

  // 페이지 로드 시 초기 상태 반영
  updateActiveMenu();
})();
