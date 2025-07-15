// 플레이어 초기화 함수
function initializePlayer(playerID) {
    const playerElement = document.getElementById(playerID);
    if (!playerElement) return; // 해당 ID의 요소가 없으면 종료
    
    // 이미 초기화됐는지 확인
    if (playerElement.dataset.initialized === 'true') return;
    
    // contentID는 data-content-id 속성에서 가져오거나 플레이어 ID에서 추출
    const contentID = playerElement.dataset.contentId || `M-${playerID.replace('player', '')}`;
    
    // videoList에서 해당 contentID에 맞는 비디오 소스 찾기
    const videoEntry = videoList.find(video => video.id === contentID);
    if (!videoEntry) {
        console.error(`Video with content ID ${contentID} not found in videoList`);
        return;
    }
    
    // HLS 인스턴스 생성
    const hls = new Hls();
    
    // Plyr 인스턴스 생성 및 커스텀 컨트롤 추가
    if (Hls.isSupported()) {
        hls.loadSource(videoEntry.src);
        hls.attachMedia(playerElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            plyrStart(playerElement, contentID);
        });
    } else if (playerElement.canPlayType('application/vnd.apple.mpegurl')) {
        playerElement.src = videoEntry.src;
        playerElement.addEventListener('loadedmetadata', function() {
            plyrStart(playerElement, contentID);
        });
    } else {
        alert("HLS를 지원하지 않는 브라우저 입니다.");
    }
    
    // 플레이어 생성
    function plyrStart(playerElement, contentID) {
        const player = new Plyr(playerElement, {
            controls: ['play-large', 'play', 'stop', 'progress', 'current-time', 'duration', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
            settings: ['speed'],
            speed: {
                selected: 1,
                options: [0.5, 1, 1.5, 2, 2.5]
            },
            captions: { active: true, update: true },
            i18n: {
                restart: '다시 시작',
                rewind: '뒤로 감기 {seektime}초',
                play: '재생',
                pause: '일시 정지',
                fastForward: '빨리 감기 {seektime}초',
                seek: '탐색',
                seekLabel: '{currentTime} / {duration}',
                played: '재생됨',
                buffered: '버퍼링 완료',
                currentTime: '현재 시간',
                duration: '전체 길이',
                volume: '볼륨',
                mute: '음소거',
                unmute: '음소거 해제',
                enableCaptions: '자막 켜기',
                disableCaptions: '자막 끄기',
                download: '다운로드',
                enterFullscreen: '전체 화면',
                exitFullscreen: '전체 화면 닫기',
                frameTitle: '플레이어',
                captions: '자막',
                settings: '설정',
                pip: 'PIP 모드',
                menuBack: '뒤로 가기',
                speed: '배속',
                normal: '보통',
                quality: '화질',
                loop: '반복',
                start: '시작',
                end: '끝',
                all: '전체',
                reset: '초기화',
                disabled: '비활성화',
                enabled: '활성화됨',
                advertisement: '광고',
                qualityBadge: {
                    2160: '4K',
                    1440: 'HD',
                    1080: 'HD',
                    720: 'HD',
                    576: 'SD',
                    480: 'SD'
                }
            }
        });

        player.once('ready', () => {
            const plyrWrapper = playerElement.closest('.plyr');
            const playButton = plyrWrapper.querySelector('.plyr__control[data-plyr="play"]');
            if (playButton) {
                // 정지 버튼 생성 및 추가
                const stopButton = Object.assign(document.createElement('button'), {
                    className: 'plyr__control plyr__control--stop',
                    type: 'button',
                    ariaLabel: '정지',
                    onclick: () => {
                        player.pause();
                        player.currentTime = 0;
                    }
                });
                playButton.insertAdjacentElement('afterend', stopButton);
            }
        });
        
        // 플레이어 초기화 표시
        playerElement.dataset.initialized = 'true';
        setupVideoEvents(playerElement, contentID);
    }
}

// xAPI 이벤트 설정 함수
function setupVideoEvents(videoElement, contentID) {
    let playStartTime = 0;
    let lastTriggerTime = 0;
    
    // 재생 시작 이벤트 감지
    videoElement.addEventListener("play", () => {    
        playStartTime = videoElement.currentTime;
        console.log(`비디오 ${contentID}가 재생되었습니다.`);

        const parentURL = new URL(document.referrer);
        window.parent.postMessage({
            type: 'video/played',
            data: {
                contentId: contentID,
                time: Math.floor(videoElement.currentTime),
                duration: Math.floor(videoElement.duration)
            }
        }, parentURL.origin);
    });
    
    // 일시정지 이벤트 감지
    videoElement.addEventListener("pause", () => {
        const pausedTime = Math.floor(videoElement.currentTime);
        const from = Math.floor(playStartTime);
        const to = pausedTime;
        const playTime = to - from;

        console.log(`비디오 ${contentID}가 일시정지되었습니다.`);

        const parentURL = new URL(document.referrer);
        window.parent.postMessage({
            type: 'video/paused',
            data: {
                contentId: contentID,
                timeFrom: from,
                timeTo: to,
                playTime: playTime,
                duration: Math.floor(videoElement.duration)
            }
        }, parentURL.origin);
    });

    // 종료 이벤트 감지
    videoElement.addEventListener("ended", () => {
        const endTime = Math.floor(videoElement.currentTime);
        const from = Math.floor(playStartTime);
        const to = endTime;
        const playTime = to - from;

        console.log(`비디오 ${contentID}가 종료되었습니다.`);

        const parentURL = new URL(document.referrer);
        window.parent.postMessage({
            type: 'video/completed',
            data: {
                contentId: contentID,
                timeFrom: from,
                timeTo: to,
                playTime: playTime,
                duration: Math.floor(videoElement.duration)
            }
        }, parentURL.origin);            
    });

    // 재생 시간 업데이트 감지
    videoElement.addEventListener("timeupdate", () => {
        const currentTime = Math.floor(videoElement.currentTime);
        
        if (currentTime >= lastTriggerTime + 10) { // 10초가 지났는지 체크
            const from = Math.floor(playStartTime);
            const to = currentTime;
            const playTime = to - from;

            console.log(`비디오 ${contentID}: 10초마다 실행됨: ${currentTime}초`);        

            const parentURL = new URL(document.referrer);
            window.parent.postMessage({
                type: 'video/timeupdated',
                data: {
                    contentId: contentID,
                    timeFrom: from,
                    timeTo: to,
                    playTime: playTime,
                    duration: Math.floor(videoElement.duration)
                }
            }, parentURL.origin);

            lastTriggerTime = currentTime;
        }
    });

    // skipped, muted 이벤트
    videoElement.addEventListener("seeked", () => {
        console.log(`비디오 ${contentID}가 skipped`);
    });
    
    videoElement.addEventListener("volumechange", function () {
        if (videoElement.muted) {
            console.log(`비디오 ${contentID}가 음소거되었습니다!`);
        } 
    });
}

// 페이지 로드 후 모든 플레이어 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 여러 플레이어 초기화 예시
    // player01, player02, ... 형식의 ID를 가진 모든 비디오 요소를 찾아 초기화
    const playerElements = document.querySelectorAll('video[id^="player"]');
    
    playerElements.forEach(player => {
        const playerId = player.id;
        
        // 사용자 상호작용 이후 재생 활성화 (페이지별로 한 번만 필요)
        if (playerElements[0].id === playerId) {
            document.body.addEventListener('click', function firstInteraction() {
                document.body.removeEventListener('click', firstInteraction);
            });
        }
        
        // 플레이어 초기화
        initializePlayer(playerId);
    });
});