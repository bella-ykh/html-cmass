//=========================================================================================
//	xAPI 데이터 전송 관련 - START
//=========================================================================================
	// 페이지 머문 시간을 추적하기 위한 변수
	let startTime;
	
	// 텍스트 콘텐츠 페이지 진입 이벤트
	window.addEventListener('message', (e) => {
		if (e.data.type === 'viewer/initialized') {
			// 페이지 시작 시간 기록
			startTime = new Date().getTime();
			
			// 페이지 시작 이벤트(text/moved)
			const parentURL = new URL(document.referrer);
			window.parent.postMessage({
				type: 'text/moved',
				data: {
					contentId: contentId,	// 콘텐츠 ID 값 지정
					page: 1,              	// 현재 페이지 번호
					pageCount: 1          	// 전체 페이지 수
				}
			}, parentURL.origin);
		}
		
		if (e.data.type === 'viewer/terminated') {
			// 현재 시간에서 시작 시간을 빼서 머문 시간 계산 (밀리초 -> 초 변환)
			const endTime = new Date().getTime();
			const duration = Math.floor((endTime - startTime) / 1000);
			
			// 페이지 종료 이벤트(text/left)
			const parentURL = new URL(document.referrer);
			window.parent.postMessage({
				type: 'text/left',
				data: {
					contentId: contentId,  	// 콘텐츠 ID 값 지정
					page: 1,               	// 현재 페이지 번호
					duration: duration     	// 계산된 페이지 머문 시간(초)
				}
			}, parentURL.origin);
		}
	});
//=========================================================================================
//	xAPI 데이터 전송 관련 - END
//=========================================================================================


//=========================================================================================
//	키보드 접근성 개선을 위한 이벤트 핸들러 - START
//=========================================================================================
	document.querySelectorAll('.radio_label[tabindex="0"]').forEach(label => {
		label.addEventListener('keydown', function(e) {
			// 엔터키(13) 또는 스페이스바(32)를 누르면 라디오 버튼 선택
			if (e.keyCode === 13 || e.keyCode === 32) {
				e.preventDefault();
				const radio = this.querySelector('input[type="radio"]');
				radio.checked = true;
			}
		});
	});
//=========================================================================================
//	키보드 접근성 개선을 위한 이벤트 핸들러 - END
//=========================================================================================


//=========================================================================================
//	라디오 버튼 토글 기능 - START
//=========================================================================================
(function() {
    // 이전에 선택된 라디오 버튼 상태를 기억하는 객체
    const previousSelections = {};
    
    // 페이지 로드 후 이벤트 핸들러 등록
    window.addEventListener('DOMContentLoaded', function() {
        setupRadioToggle();
    });
    
    // 라디오 버튼 토글 기능 설정
    function setupRadioToggle() {
        // 기존 이벤트 핸들러 대체를 위해 HTML 내의 키보드 이벤트 핸들러 비활성화
        overrideExistingHandlers();
        
        // 모든 라디오 버튼 찾기
        const allRadios = document.querySelectorAll('input[type="radio"]');
        
        // 초기 상태 저장
        allRadios.forEach(function(radio) {
            if (radio.checked) {
                previousSelections[radio.name] = radio.value;
            }
        });
        
        // 라벨 처리
        document.querySelectorAll('.radio_label').forEach(function(label) {
            // 클릭 이벤트 처리
            label.addEventListener('click', function(e) {
                const radio = this.querySelector('input[type="radio"]');
                if (!radio) return;
                
                // 이미 체크된 라디오를 다시 클릭한 경우
                if (radio.checked && previousSelections[radio.name] === radio.value) {
                    // 기본 이벤트 방지
                    e.preventDefault();
                    // 체크 해제
                    setTimeout(function() {
                        radio.checked = false;
                        previousSelections[radio.name] = null;
                    }, 0);
                } else {
                    // 다른 라디오 선택하는 경우는 기본 브라우저 동작 허용
                    setTimeout(function() {
                        previousSelections[radio.name] = radio.value;
                    }, 0);
                }
            });
            
            // 키보드 이벤트 핸들러 추가
            label.addEventListener('keydown', function(e) {
                // 엔터키(13) 또는 스페이스바(32) 처리
                if (e.keyCode === 13 || e.keyCode === 32) {
                    e.preventDefault(); // 기본 동작 방지

                    const radio = this.querySelector('input[type="radio"]');
                    if (!radio) return;
                    
                    // 현재 체크 상태에 따라 토글
                    if (radio.checked) {
                        // 체크 해제
                        radio.checked = false;
                        previousSelections[radio.name] = null;
                    } else {
                        // 체크
                        radio.checked = true;
                        previousSelections[radio.name] = radio.value;
                    }
                    
                    // 변경 이벤트 발생 (폼 검증 등을 위해)
                    const event = new Event('change', { bubbles: true });
                    radio.dispatchEvent(event);
                }
            });
        });
    }
    
    // 기존 이벤트 핸들러 비활성화
    function overrideExistingHandlers() {
        // 이미 등록된 이벤트 핸들러와 충돌 방지
        document.querySelectorAll('.radio_label[tabindex="0"]').forEach(function(label) {
            // 이미 등록된 모든 keydown 이벤트 핸들러 제거를 시도하는 방법
            const newLabel = label.cloneNode(true);
            if (label.parentNode) {
                label.parentNode.replaceChild(newLabel, label);
            }
        });
    }
})(); 
//=========================================================================================
//	라디오 버튼 토글 기능 - END
//=========================================================================================
