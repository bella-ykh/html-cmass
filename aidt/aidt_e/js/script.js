// 부드러운 스크롤과 활성화된 메뉴 처리
document.querySelectorAll('.nav_menu a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // 기본 앵커 동작(페이지 이동)을 막음

        // 모든 메뉴 항목에서 'active' 클래스를 제거
        document.querySelectorAll('.nav_menu li').forEach(li => li.classList.remove('active'));

        // 클릭한 메뉴 항목에 'active' 클래스 추가
        this.parentElement.classList.add('active');

        // 고정된 헤더 높이를 고려하여 대상 섹션으로 스크롤 이동
        const targetId = this.getAttribute('href').slice(1); // 대상 ID 가져오기
        const targetElement = document.getElementById(targetId); // ID에 해당하는 요소 가져오기

        if (targetElement) {
            const navHeight = document.querySelector('header').offsetHeight; // 헤더 높이 가져오기
            const targetPosition = targetElement.offsetTop - navHeight; // 위치를 헤더 높이만큼 보정
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth' // 부드러운 스크롤 효과
            });
        }
    });
});

// **📌 스크롤 시 현재 섹션 감지하여 메뉴 활성화**
const sections = document.querySelectorAll('section'); // 모든 섹션 가져오기
const navLinks = document.querySelectorAll('.nav_menu a'); // 네비게이션 메뉴 항목 가져오기
const navHeight = document.querySelector('header').offsetHeight; // 헤더 높이

function activateMenuOnScroll() {
    let scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 10; // 보정값 추가
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollY >= sectionTop && scrollY < sectionBottom) {
            const id = section.getAttribute('id');

            // 모든 메뉴 항목에서 'active' 제거
            navLinks.forEach(link => link.parentElement.classList.remove('active'));

            // 현재 보이는 섹션과 연결된 메뉴에 'active' 추가
            const activeLink = document.querySelector(`.nav_menu a[href="#${id}"]`);
            if (activeLink) {
                activeLink.parentElement.classList.add('active');
            }
        }
    });
}

// **Intersection Observer 추가 (스크롤 성능 최적화)**
const observerOptions = {
    root: null, // 뷰포트 기준
    rootMargin: `-${navHeight}px 0px -60% 0px`, // 네비게이션 높이 반영
    threshold: 0.1 // 10% 이상 화면에 보일 때 감지
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            // 모든 메뉴 항목에서 'active' 제거
            navLinks.forEach(link => link.parentElement.classList.remove('active'));

            // 현재 보이는 섹션과 연결된 메뉴에 'active' 추가
            const activeLink = document.querySelector(`.nav_menu a[href="#${id}"]`);
            if (activeLink) {
                activeLink.parentElement.classList.add('active');
            }
        }
    });
}, observerOptions);

// **모든 섹션을 감지 대상으로 설정**
sections.forEach(section => observer.observe(section));

// **스크롤 이벤트 리스너 추가 (보조적인 역할)**
window.addEventListener('scroll', activateMenuOnScroll);

// **초기 로딩 시 현재 위치에 따라 활성화**
window.addEventListener('load', activateMenuOnScroll);
