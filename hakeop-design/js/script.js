/* ===== 자주 묻는 질문(FAQ) 아코디언 ===== */
document.addEventListener('DOMContentLoaded', function () {
    // 질문 버튼 전체를 가져옵니다. (.faq-q-wrap 안의 button.faq-q)
    var faqButtons = document.querySelectorAll('.section-faq .faq-q');

    // 열림/닫힘 애니메이션 시간(ms) - CSS 쪽 transition 값이 아니라 JS에서 직접 지정합니다.
    var DURATION = 300;

    // 사용자가 '동작 줄이기'를 설정했으면 애니메이션 없이 바로 열고 닫습니다.
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 답변 영역 열기
    function openAnswer(item, btn, answer) {
        item.classList.add('is-open');                // + 아이콘을 - 로 바꾸는 클래스 (CSS에서 처리)
        btn.setAttribute('aria-expanded', 'true');    // 스크린리더용 상태값
        answer.hidden = false;                        // hidden 속성 제거 → 화면에 표시

        if (reduceMotion) {
            answer.style.height = 'auto';
            return;
        }

        // 답변의 실제 높이(scrollHeight)까지 height를 늘려 부드럽게 열기
        answer.style.transition = 'height ' + DURATION + 'ms ease';
        answer.style.height = answer.scrollHeight + 'px';

        // 애니메이션이 끝나면 height를 auto로 바꿔 화면 크기 변화에도 대응
        setTimeout(function () {
            if (item.classList.contains('is-open')) {
                answer.style.height = 'auto';
            }
        }, DURATION);
    }

    // 답변 영역 닫기
    function closeAnswer(item, btn, answer) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');

        if (reduceMotion) {
            answer.style.height = '0';
            answer.hidden = true;
            return;
        }

        // height:auto 상태에서는 애니메이션이 안 되므로, 현재 높이를 px로 먼저 고정
        answer.style.height = answer.scrollHeight + 'px';
        answer.offsetHeight; // 강제 리플로우: 위 높이값을 브라우저가 먼저 적용하도록 함
        answer.style.transition = 'height ' + DURATION + 'ms ease';
        answer.style.height = '0';

        // 애니메이션이 끝나면 hidden 속성을 다시 붙여 완전히 숨김
        setTimeout(function () {
            if (!item.classList.contains('is-open')) {
                answer.hidden = true;
            }
        }, DURATION);
    }

    // 각 질문 버튼에 클릭 이벤트 연결
    faqButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');                       // 현재 문항(li)
            var answer = document.getElementById(btn.getAttribute('aria-controls')); // 연결된 답변 영역

            // 열려 있으면 닫고, 닫혀 있으면 엽니다.
            // 다른 문항은 건드리지 않으므로 여러 개를 동시에 열어둘 수 있습니다.
            if (item.classList.contains('is-open')) {
                closeAnswer(item, btn, answer);
            } else {
                openAnswer(item, btn, answer);
            }
        });
    });
});
