document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".lnb");
  const menuItems = document.querySelectorAll(".lnb ul li a");

  // 메뉴 href 기준으로 실제 타깃 요소 수집 (#home은 header, 나머지는 section)
  const targets = Array.from(menuItems)
    .map((a) => {
      const id = a.getAttribute("href")?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  // 내비 높이(스티키), 반응형 대비 안전하게 실제 높이 참조
  const getNavHeight = () => (nav ? nav.offsetHeight || 80 : 80);

  // 프로그램적 스크롤 상태 플래그
  let isAutoScrolling = false;
  let autoScrollEndTimer = null;

  // 부드러운 스크롤
  function smoothScrollTo(targetEl) {
      const y = Math.max(targetEl.offsetTop, 0);   // 섹션 top을 0에 맞춤
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // 활성 표시 유틸
  function setActiveByEl(targetEl) {
    const id = targetEl.id;
    menuItems.forEach((link) => link.classList.remove("is-active"));
    const currentLink = document.querySelector(`.lnb ul li a[href="#${id}"]`);
    if (currentLink) currentLink.classList.add("is-active");
  }

  // 스크롤 스파이
  function updateActiveOnScroll() {
    if (isAutoScrolling) return; // 자동 스크롤 중에는 잠시 중단

    const scrollY = window.scrollY + getNavHeight() + 0; // 약간의 여유
    for (const section of targets) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        setActiveByEl(section);
        break;
      }
    }
  }

  // 클릭 시: 바로 활성 고정 + 자동 스크롤 시작
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.getAttribute("href")?.slice(1);
      const targetEl = id ? document.getElementById(id) : null;
      if (!targetEl) return;

      // 클릭 즉시 해당 메뉴만 활성
      menuItems.forEach((link) => link.classList.remove("is-active"));
      this.classList.add("is-active");

      // 자동 스크롤 모드로 전환 (스파이 일시 중지)
      isAutoScrolling = true;
      clearTimeout(autoScrollEndTimer);

      smoothScrollTo(targetEl);

      // 스크롤이 끝났다고 판단되는 시점(스크롤 이벤트가 잠잠해지면)에서만 스파이 재개
      const settle = () => {
        clearTimeout(autoScrollEndTimer);
        autoScrollEndTimer = setTimeout(() => {
          isAutoScrolling = false;
          // 안전하게 한 번 더 목표를 활성화
          setActiveByEl(targetEl);
          updateActiveOnScroll();
        }, 150);
      };

      // 사용자/프로그램 스크롤 모두 캡처
      const onScroll = () => settle();
      window.addEventListener("scroll", onScroll, { passive: true });

      // 500ms 뒤에도 스크롤 이벤트가 없으면 강제로 종료 처리(브라우저에 따라 smooth 끝 신호가 미묘할 때 대비)
      setTimeout(() => settle(), 500);
    });
  });

  // 초기 활성화
  updateActiveOnScroll();

  // 일반 스크롤 시 활성 업데이트
  window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
});
