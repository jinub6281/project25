document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  registerBtn.addEventListener("click", async () => {
    const id = document.getElementById("regId").value;
    const pw = document.getElementById("regPw").value;

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw })
      });
      const data = await res.json();
      if (data.success) {
        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
        location.href = "login.html";
      } else {
        alert(`회원가입 실패: ${data.message}`);
      }
    } catch (err) {
      console.error("회원가입 fetch 에러:", err);
    }
  });
});