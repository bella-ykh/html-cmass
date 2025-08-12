document.addEventListener("DOMContentLoaded", function() {
  const menuItems = document.querySelectorAll('.lnb ul li a');
  const sections = document.querySelectorAll('section'); // 모든 섹션을 선택하여 위치 추적

  // 부드러운 스크롤 기능 (메뉴 클릭 시)
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();  // 기본 앵커 링크 동작 방지

      // 클릭한 메뉴 항목의 href 속성에서 ID를 추출하고, 해당 섹션으로 스크롤
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      // 부드럽게 해당 섹션으로 스크롤 이동
      window.scrollTo({
        top: targetSection.offsetTop,
        behavior: "smooth"
      });

      // 모든 메뉴 항목에서 'is-active' 클래스 제거 후, 클릭한 메뉴에 클래스 추가
      menuItems.forEach(link => link.classList.remove('is-active'));
      this.classList.add('is-active');
    });
  });

  // 스크롤 이벤트 처리 (스크롤 시 해당 섹션의 메뉴 활성화)
  function updateActiveMenu() {
    const scrollPosition = window.scrollY;  // 화면의 최상단 위치 기준으로 섹션을 감지

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      const menuItem = document.querySelector(`.lnb ul li a[href="#${section.id}"]`);

      // 섹션의 상단이 화면의 상단에 오면 해당 메뉴 항목 활성화
      if (scrollPosition >= sectionTop - 50 && scrollPosition < sectionBottom - 50) {
        menuItems.forEach(link => link.classList.remove('is-active'));  // 기존 활성화된 메뉴 항목 클래스 제거
        menuItem.classList.add('is-active');  // 현재 섹션에 해당하는 메뉴 항목에 클래스 추가
      }
    });
  }

  // 페이지 로드 시 초기 메뉴 활성화 (첫 페이지 위치에 맞춰)
  updateActiveMenu();

  // 스크롤 시 메뉴 활성화
  window.addEventListener('scroll', updateActiveMenu);
});
