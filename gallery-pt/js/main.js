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
    const accordionToggles = document.querySelectorAll('.accordion-toggle');

    accordionToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const targetVideos = document.getElementById(targetId);
            const isActive = toggle.classList.contains('active');
            const sportsSection = toggle.closest('.sports-section');

            // 닫기 아이콘을 클릭했을 때만 아코디언 닫기
            if (isActive) {
                toggle.classList.remove('active');
                targetVideos.classList.remove('active');
                
                // 아코디언을 닫을 때 모든 detail-btn의 active 클래스도 제거
                sportsSection.querySelectorAll('.detail-btn').forEach(btn => btn.classList.remove('active'));
                targetVideos.querySelectorAll('.sports-video').forEach(video => video.classList.remove('active'));
            } else {
                // 열기 아이콘을 클릭했을 때 아코디언 열기
                openAccordion(toggle, targetVideos, sportsSection);
            }
        });
    });
}

// 아코디언 열기 함수 (공통 사용)
function openAccordion(toggle, targetVideos, sportsSection) {
    toggle.classList.add('active');
    targetVideos.classList.add('active');
    
    // 첫 번째 비디오와 버튼 활성화
    const firstVideo = targetVideos.querySelector('.sports-video');
    const firstBtn = sportsSection.querySelector('.detail-btn');
    
    if (firstVideo && firstBtn) {
        // 모든 비디오와 버튼 비활성화
        targetVideos.querySelectorAll('.sports-video').forEach(v => v.classList.remove('active'));
        sportsSection.querySelectorAll('.detail-btn').forEach(b => b.classList.remove('active'));
        
        // 첫 번째 항목들 활성화
        firstVideo.classList.add('active');
        firstBtn.classList.add('active');
    }
}

// ===========================
// 상세 메뉴 기능
// ===========================
function initDetailMenu() {
    const detailButtons = document.querySelectorAll('.detail-btn');

    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const targetVideo = document.getElementById(targetId);
            const sportsSection = button.closest('.sports-section');
            
            if (!targetVideo || !sportsSection) return;

            // 해당 스포츠 섹션의 아코디언이 닫혀있다면 먼저 열기
            const accordionToggle = sportsSection.querySelector('.accordion-toggle');
            const targetVideosId = accordionToggle.dataset.target;
            const targetVideos = document.getElementById(targetVideosId);
            
            if (!accordionToggle.classList.contains('active')) {
                openAccordion(accordionToggle, targetVideos, sportsSection);
            }

            // 같은 섹션 내의 모든 버튼과 비디오 비활성화
            sportsSection.querySelectorAll('.detail-btn').forEach(btn => btn.classList.remove('active'));
            sportsSection.querySelectorAll('.sports-video').forEach(video => video.classList.remove('active'));

            // 클릭한 버튼과 해당 비디오 활성화
            button.classList.add('active');
            targetVideo.classList.add('active');
        });
    });
}

// ===========================
// 교과서 썸네일 인터랙션
// ===========================
function initThumbnailInteraction() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');

    thumbnails.forEach((thumbnail, index) => {
        // 클릭 이벤트 (추후 상세 페이지 이동 등에 활용 가능)
        thumbnail.addEventListener('click', () => {
            console.log(`교과서 ${index + 1} 클릭됨`);
            // 여기에 교과서 상세 페이지 이동 로직 추가 가능
        });
    });
}

// ===========================
// 영상 모달 기능
// ===========================
function initVideoModal() {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalTitle');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoSource = document.getElementById('videoSource');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.querySelector('.modal-overlay');

    // 썸네일 클릭 시 모달 열기 (다운로드 링크 제외)
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            // 다운로드 링크나 아이콘 클릭 시 모달 열기 방지
            if (e.target.classList.contains('download-icon') || 
                e.target.classList.contains('download-link') ||
                e.target.closest('.download-link')) {
                e.stopPropagation();
                return;
            }
            
            const videoUrl = thumbnail.dataset.videoUrl;
            const videoTitle = thumbnail.dataset.videoTitle;
            
            // 모달 내용 설정
            modalTitle.textContent = videoTitle;
            videoSource.src = videoUrl;
            videoPlayer.load(); // 새로운 소스 로드
            
            // 모달 열기
            openModal();
            
            // 모달이 완전히 열린 후 영상 재생
            setTimeout(() => {
                videoPlayer.play().catch(error => {
                    console.log('자동 재생이 차단되었습니다:', error);
                });
            }, 300);
        });
    });

    // 모달 닫기 버튼 클릭
    modalClose.addEventListener('click', closeModal);

    // 모달 오버레이 클릭 시 닫기
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // 모달 열기 함수
    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }

    // 모달 닫기 함수
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 스크롤 복원
        
        // 영상 정지 및 초기화
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        
        setTimeout(() => {
            if (!modal.classList.contains('active')) {
                videoSource.src = '';
                videoPlayer.load();
            }
        }, 300); // 애니메이션 완료 후 실행
    }

    // 모달이 열려있을 때 배경 클릭 방지
    modal.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 영상 로드 에러 처리
    videoPlayer.addEventListener('error', (e) => {
        console.error('영상 로드 오류:', e);
        alert('영상을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
        closeModal();
    });
}

// ===========================
// 다운로드 기능
// ===========================
function initDownloadFunction() {
    const downloadLinks = document.querySelectorAll('.download-link');
    
    downloadLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation(); // 썸네일 클릭 이벤트 방지
            e.preventDefault(); // 기본 링크 동작 방지
            
            const videoItem = link.closest('.video-item');
            const thumbnail = videoItem.querySelector('.video-thumbnail');
            const videoUrl = thumbnail.dataset.videoUrl;
            const videoTitle = thumbnail.dataset.videoTitle;
            
            // 다운로드 실행
            downloadVideo(videoUrl, videoTitle);
        });
    });
}

function downloadVideo(url, filename) {
    try {
        // 임시 링크 요소 생성
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.mp4`;
        link.target = '_blank';
        
        // 링크 클릭하여 다운로드 시작
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`다운로드 시작: ${filename}`);
    } catch (error) {
        console.error('다운로드 오류:', error);
        alert('다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// ===========================
// 영상 썸네일 호버 효과 개선
// ===========================
function initVideoThumbnailEffects() {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(thumbnail => {
        const playButton = thumbnail.querySelector('.play-button');
        
        // 마우스 진입 시 플레이 버튼 애니메이션
        thumbnail.addEventListener('mouseenter', () => {
            playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        // 마우스 이탈 시 플레이 버튼 원래 크기
        thumbnail.addEventListener('mouseleave', () => {
            playButton.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // 클릭 시 버튼 애니메이션
        thumbnail.addEventListener('mousedown', () => {
            playButton.style.transform = 'translate(-50%, -50%) scale(0.95)';
        });
        
        thumbnail.addEventListener('mouseup', () => {
            playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
    });
}

// ===========================
// 초기화
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAccordion();
    initDetailMenu();
    initThumbnailInteraction();
    initVideoModal();
    initVideoThumbnailEffects();
    initDownloadFunction();
    
    // 페이지 로드 시 모든 아코디언이 닫힌 상태로 시작
    // 자동으로 아코디언을 여는 코드 제거됨
});

// ===========================
// 스크롤 애니메이션 (메인 콘텐츠만)
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

    // 헤더 썸네일 호버 효과에 영향을 주지 않도록 메인 콘텐츠만 대상으로 함
    const sportsSection = document.querySelectorAll('.sports-section');
    sportsSection.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// 스크롤 애니메이션 초기화 (DOMContentLoaded 후)
window.addEventListener('load', () => {
    initScrollAnimation();
});
