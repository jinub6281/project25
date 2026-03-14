document.addEventListener("DOMContentLoaded", () => {
  const bar = document.createElement("div");
  bar.className = "top-right-buttons";

  bar.innerHTML = `
    <button id="darkModeToggle" aria-label="다크모드 토글">🌙</button>
    <button id="logoutBtn">로그아웃</button>
  `;

  document.body.appendChild(bar);

  /* 다크모드 */
  const toggle = document.getElementById("darkModeToggle");
  const saved = localStorage.getItem("darkMode");

  if (saved === "on") {
    document.body.classList.add("dark");
  }

  toggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "darkMode",
      document.body.classList.contains("dark") ? "on" : "off"
    );
  };

  /* 로그아웃 */
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("login");
    location.href = "/login";
  };
});