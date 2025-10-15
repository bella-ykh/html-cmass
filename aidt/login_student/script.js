import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

let selectedClass = null;
let selectedStudentData = null;
let classStudentsCache = {}; // 반별 학생 데이터 캐싱

const classButtons = document.querySelectorAll('.class-btn');
const studentButtonsContainer = document.getElementById('studentButtons');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorModal = document.getElementById('errorModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');

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

// Firestore에서 해당 반 학생 데이터 가져오기
async function loadClassStudents(classNum) {
    // 캐시에 있으면 캐시 사용
    if (classStudentsCache[classNum]) {
        return classStudentsCache[classNum];
    }

    try {
        const db = window.firebaseDB;
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('class', '==', classNum));
        const querySnapshot = await getDocs(q);

        const students = [];
        querySnapshot.forEach((doc) => {
            students.push(doc.data());
        });

        students.sort((a, b) => a.name.localeCompare(b.name));
        classStudentsCache[classNum] = students;

        return students;

    } catch (error) {
        console.error('학생 데이터 로드 실패:', error);
        alert('학생 정보를 불러오는데 실패했습니다.');
        return [];
    }
}


// 반 선택 이벤트
function setupClassButtons() {
    classButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            classButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedClass = this.dataset.class;
            selectedStudentData = null;

            // Firestore에서 해당 반 학생 데이터 가져오기
            const students = await loadClassStudents(selectedClass);

            // 학생 버튼 활성화
            const studentBtns = studentButtonsContainer.querySelectorAll('.student-btn');
            studentBtns.forEach((sBtn, index) => {
                sBtn.classList.remove('active');
                
                if (index < students.length) {
                    sBtn.disabled = false;
                    sBtn.onclick = function() {
                        studentBtns.forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        selectedStudentData = students[index];
                    };
                } else {
                    sBtn.disabled = true;
                    sBtn.onclick = null;
                }
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

    if (!selectedStudentData) {
        showError();
        return;
    }

    if (password === selectedStudentData.password) {
        // 로그인 성공 - 학생 전용 URL로 이동
        window.location.href = selectedStudentData.url;
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
function init() {
    createStudentButtons();
    setupClassButtons();
    setupEnterKey();
    
    loginBtn.addEventListener('click', handleLogin);
    modalCloseBtn.addEventListener('click', closeModal);
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', init);