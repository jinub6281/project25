document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addAdmin");
  const newId = document.getElementById("newId");
  const newPw = document.getElementById("newPw");

  if (!form || !newId || !newPw) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!newId.value || !newPw.value) {
      alert("아이디와 비밀번호를 입력하세요");
      return;
    }

    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newId.value,
          password: newPw.value
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("관리자 추가 완료");
        newId.value = "";
        newPw.value = "";
      } else {
        alert(data.error || "추가 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  });
});