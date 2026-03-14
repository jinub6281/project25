console.log("auth.js 실행됨");

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const isLogin = localStorage.getItem("login");

  /* 로그인 체크 */
  if (isLogin !== "true") {
    location.href = "login.html";
    return;
  }

  /* index.html 전용 버튼 */
  const logoutBtn = document.getElementById("logoutBtn");
  const darkModeBtn = document.getElementById("darkModeToggle");

  if (currentPage === "index.html") {
    if (logoutBtn) logoutBtn.hidden = false;
    if (darkModeBtn) darkModeBtn.hidden = false;
  } else {
    if (logoutBtn) logoutBtn.hidden = true;
    if (darkModeBtn) darkModeBtn.hidden = true;
  }
});