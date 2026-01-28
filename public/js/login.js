document.addEventListener("DOMContentLoaded", () => {

  console.log("login.js 실행됨");

  const loginBtn = document.getElementById("loginBtn");
  const idInput = document.getElementById("id");
  const pwInput = document.getElementById("pw");

  if (!loginBtn || !idInput || !pwInput) {
    console.error("필수 요소 못 찾음");
    return;
  }

  let isComposing = false;

  // 한글 조합 시작
  idInput.addEventListener("compositionstart", () => {
    isComposing = true;
  });

  // 한글 조합 끝
  idInput.addEventListener("compositionend", () => {
    isComposing = false;
    idInput.value = idInput.value.replace(/[^a-zA-Z]/g, "");
  });

  // 입력될 때마다 영어만 남김
  idInput.addEventListener("input", () => {
    if (isComposing) return;
    idInput.value = idInput.value.replace(/[^a-zA-Z]/g, "");
  });

  // **IME 포함 영어 외 입력 차단**
  idInput.addEventListener("beforeinput", (e) => {
    const char = e.data;
    if (char && !/^[a-zA-Z]+$/.test(char)) {
      e.preventDefault(); // 영어 외 입력 차단
    }
  });

  // 붙여넣기 영어만 허용
  idInput.addEventListener("paste", (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^[a-zA-Z]*$/.test(paste)) {
      e.preventDefault();
    }
  });

  async function doLogin() {
  const id = idInput.value.trim();
  const pw = pwInput.value;

  if (!id || !pw) {
    alert("아이디와 비밀번호를 입력하세요");
    return;
  }

  const res = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",   // ⭐⭐⭐ 핵심
    body: JSON.stringify({ id, pw })
  });

  if (!res.ok) {
    alert("서버 오류");
    return;
  }

  const data = await res.json();
  console.log("서버 응답:", data);

  if (data.success) {
    location.href = "/";      // 서버에서 requireLogin 통과
  } else {
    alert("로그인 실패");
  }
}

  // 버튼 클릭
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault(); // form submit 막기
    doLogin();
  });

  // Enter 키 로그인
  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doLogin();
    }
  });

});