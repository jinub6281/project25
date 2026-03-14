const adminList = document.getElementById("adminList");
const modal = document.getElementById("pwModal");
const modalUser = document.getElementById("modalUser");
const newPasswordInput = document.getElementById("newPassword");

let selectedUser = "";

/* 관리자 목록 불러오기 */
async function loadAdmins() {
  const res = await fetch("/api/admin/list");
  const admins = await res.json();

  adminList.innerHTML = "";

  admins.forEach(admin => {
    const div = document.createElement("div");
    div.className = "admin-item";

    div.innerHTML = `
      <span>${admin.username}</span>
      <div class="actions">
        <button class="btn reset" onclick="openModal(${admin.id}, '${admin.username}')">
          비밀번호 변경
        </button>
        <button class="btn delete" onclick="deleteAdmin('${admin.username}')">
          삭제
        </button>
      </div>
    `;

    adminList.appendChild(div);
  });
}

async function deleteAdmin(id, username) {
  if (!confirm(`관리자 "${username}" 계정을 삭제할까요?`)) return;

  const res = await fetch(`/api/admin/delete/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();

  if (data.success) {
    alert("삭제 완료");
    loadAdmins();
  } else {
    alert(data.error || "삭제 실패");
  }
}

/* 모달 열기 */
function openModal(username) {
  selectedUser = username;
  modalUser.textContent = `${username} 비밀번호 변경`;
  newPasswordInput.value = "";

  modal.classList.remove("hidden");
  modal.classList.remove("closing");
}

/* 모달 닫기 (애니메이션) */
function closeModal() {
  modal.classList.add("closing");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("closing");
  }, 200);
}

/* 비밀번호 변경 */
async function submitReset() {
  const newPw = newPasswordInput.value.trim();
  if (!newPw) return alert("비밀번호를 입력하세요");

  const res = await fetch("/api/admin/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: selectedUser,
      password: newPw
    })
  });

  const data = await res.json();

  if (data.success) {
    alert("비밀번호 변경 완료");
    closeModal();
  } else {
    alert("변경 실패");
  }
}

/* ESC 키로 닫기 */
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

loadAdmins();