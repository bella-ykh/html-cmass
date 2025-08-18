document.addEventListener('DOMContentLoaded', () => {
    const teacherMenu = document.getElementById('teacherMenu');
    const studentMenu = document.getElementById('studentMenu');
    let selectedTeacher = null; // 선택된 선생님 값
  
    // "선생님 체험하기" 버튼 클릭 이벤트
    document.querySelector('.btn_menu[data-target="teacher"]').addEventListener('click', () => {
      teacherMenu.style.display = 'block'; // 선생님 메뉴 표시
      studentMenu.style.display = 'none'; // 학생 메뉴 숨김
    });
  
    // "선생님" 메뉴 클릭 이벤트
    teacherMenu.addEventListener('click', (event) => {
      if (event.target.classList.contains('sub_menu')) {
        selectedTeacher = event.target.dataset.value; // 선택된 선생님 값 저장
        alert(`${event.target.textContent}를 선택했습니다.`);
      }
    });
  
    // "학생 체험하기" 버튼 클릭 이벤트
    document.querySelector('.btn_menu[data-target="student"]').addEventListener('click', () => {
      if (!selectedTeacher) {
        alert('먼저 선생님을 선택하세요.');
        return;
      }
  
      // 학생 메뉴 동적 생성
      studentMenu.innerHTML = ''; // 이전 메뉴 초기화
      for (let i = 1; i <= 4; i++) {
        const studentLink = document.createElement('a');
        studentLink.classList.add('sub_menu');
        studentLink.textContent = `학생 ${selectedTeacher.split('teacher')[1]}-${i}`;
        studentLink.href = `https://example.com/${selectedTeacher}-${i}`; // 동적 URL 생성
        studentLink.target = '_blank'; // 새 창에서 열기
        studentMenu.appendChild(studentLink);
      }
  
      studentMenu.style.display = 'block'; // 학생 메뉴 표시
    });
  
    // "학생" 메뉴 클릭 이벤트
    studentMenu.addEventListener('click', (event) => {
      if (event.target.classList.contains('sub_menu')) {
        alert(`${event.target.textContent}를 선택했습니다.`);
      }
    });
  });
  