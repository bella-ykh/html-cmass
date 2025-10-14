let studentData = {};
let selectedClass = null;
let selectedStudent = null;

const classButtons = document.querySelectorAll('.class-btn');
const studentButtonsContainer = document.getElementById('studentButtons');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorModal = document.getElementById('errorModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// JSON 파일 로드
async function loadStudentData() {
    try {
        const response = await fetch('students.json');
        studentData = await response.json();
        console.log('학생 데이터 로드 완료');
    } catch (error) {
        console.error('학생 데이터 로드 실패:', error);
        alert('학생 데이터를 불러오는데 실패했습니다.');
    }
}

// 초기 학생 버튼 생성 (비활성화 상태)
function createStudentButtons() {
    studentButtonsContainer.innerHTML = '';
    for (let i = 1; i <= 25; i++) {
        const btn = document.createElement('button');
        btn.className = 'student-btn';
        btn.textContent = `학생${String(i).padStart(3, '0')}`;
        btn.disabled = true;
        studentButtonsContainer.appendChild(btn);
    }
}

// 반 선택 이벤트
function setupClassButtons() {
    classButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            classButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedClass = this.dataset.class;
            selectedStudent = null;
            
            // 학생 버튼 활성화
            const studentBtns = studentButtonsContainer.querySelectorAll('.student-btn');
            studentBtns.forEach((sBtn, index) => {
                sBtn.disabled = false;
                sBtn.classList.remove('active');
                sBtn.onclick = function() {
                    studentBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    selectedStudent = studentData[selectedClass][index];
                };
            });
        });
    });
}

// 로그인 처리
function handleLogin() {
    const password = passwordInput.value.trim();

    if (!selectedClass) {
        showError();
        return;
    }

    if (!selectedStudent) {
        showError();
        return;
    }

    if (password === selectedStudent.password) {
        // 로그인 성공 - 학생 전용 URL로 이동
        window.location.href = selectedStudent.url;
    } else {
        // 로그인 실패
        showError();
    }
}

// 에러 모달 표시
function showError() {
    errorModal.classList.add('show');
}

// 모달 닫기
function closeModal() {
    errorModal.classList.remove('show');
    passwordInput.value = '';
}

// 엔터키로 로그인
function setupEnterKey() {
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
}

// 초기화
async function init() {
    await loadStudentData();
    createStudentButtons();
    setupClassButtons();
    setupEnterKey();
    
    loginBtn.addEventListener('click', handleLogin);
    modalCloseBtn.addEventListener('click', closeModal);
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', init);