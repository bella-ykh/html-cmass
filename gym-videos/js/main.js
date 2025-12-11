// ===========================
// 탭 기능
// ===========================
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // 모든 탭 버튼과 컨텐츠의 active 클래스 제거
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 클릭한 탭 버튼에 active 클래스 추가
            button.classList.add('active');

            // 해당 탭 컨텐츠에 active 클래스 추가
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// ===========================
// 아코디언 기능
// ===========================
function initAccordion() {
    const skillButtons = document.querySelectorAll('.skill-btn');

    skillButtons.forEach(button => {
        button.addEventListener('click', () => {
            const skillId = button.dataset.skill;
            const skillContent = document.getElementById(skillId);
            const isOpen = skillContent.classList.contains('open');

            // 같은 sport-card 내의 다른 아코디언 닫기
            const sportCard = button.closest('.sport-card');
            const allSkillsInCard = sportCard.querySelectorAll('.skill-content');
            const allButtonsInCard = sportCard.querySelectorAll('.skill-btn');

            allSkillsInCard.forEach(content => {
                content.classList.remove('open');
            });

            allButtonsInCard.forEach(btn => {
                btn.classList.remove('active');
            });

            // 클릭한 아코디언이 닫혀있었다면 열기
            if (!isOpen) {
                skillContent.classList.add('open');
                button.classList.add('active');

                // 부드러운 스크롤 효과
                setTimeout(() => {
                    skillContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 100);
            }
        });
    });
}

// ===========================
// 교과서 썸네일 인터랙션
// ===========================
function initThumbnailInteraction() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');

    thumbnails.forEach((thumbnail, index) => {
        // 순차적인 애니메이션 효과
        thumbnail.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
        thumbnail.style.opacity = '0';

        // 클릭 이벤트 (추후 상세 페이지 이동 등에 활용 가능)
        thumbnail.addEventListener('click', () => {
            console.log(`교과서 ${index + 1} 클릭됨`);
            // 여기에 교과서 상세 페이지 이동 로직 추가 가능
        });
    });
}

// ===========================
// 초기화
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAccordion();
    initThumbnailInteraction();

    // 페이지 로드시 첫 번째 탭 활성화 확인
    const firstTab = document.querySelector('.tab-btn.active');
    if (firstTab) {
        const targetTab = firstTab.dataset.tab;
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
});

// ===========================
// 스크롤 애니메이션 (선택적)
// ===========================
function initScrollAnimation() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    const sportCards = document.querySelectorAll('.sport-card');
    sportCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// 스크롤 애니메이션 초기화 (DOMContentLoaded 후)
window.addEventListener('load', () => {
    initScrollAnimation();
});

