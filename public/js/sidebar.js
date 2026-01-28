document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("sidebar.html");
  const html = await res.text();

  document.body.insertAdjacentHTML("afterbegin", html);
});