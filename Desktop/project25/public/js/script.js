document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const dashboardBtn = document.getElementById("dashboardBtn")
  const body = document.body;


  // 🔐 로그인 상태
  const isLogin = localStorage.getItem("login");

  if (isLogin === "true") {
    logoutBtn.hidden = false;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("login");
    location.href = "login.html";
  });

if (dashboardBtn) {
  dashboardBtn.addEventListener("click", () => {
    location.href = "dashboard.html";
  });
}

  if (localStorage.getItem("login") !== "true") {
  const alertBox = document.getElementById("loginAlert");
  if (alertBox) {
    alertBox.style.display = "block";
  }
  setTimeout(() => {
    location.href = "login.html";
  }, 1000);
}

  // 🌙 다크모드
  const savedMode = localStorage.getItem("theme");
  if (savedMode === "dark") {
    body.classList.add("dark");
    darkModeToggle.textContent = "☀️";
  }

  darkModeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    darkModeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});