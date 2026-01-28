const fileList = document.getElementById("fileList");

function loadFiles() {
  fetch("/api/files")
    .then(res => res.json())
    .then(files => {
      fileList.innerHTML = "";

      if (files.length === 0) {
        fileList.innerHTML = "<li>파일이 없습니다</li>";
        return;
      }

      files.forEach(file => {
        const li = document.createElement("li");
        li.className = "file-item";

        li.innerHTML = `
          <span class="file-name">${file.name}</span>

          <div class="actions">
            <a href="${file.url}" target="_blank">열기</a>
            <button class="delete-btn">삭제</button>
          </div>
        `;

        // 삭제 버튼 이벤트
        li.querySelector(".delete-btn").onclick = () => {
          if (!confirm("정말 삭제할까요?")) return;

          fetch(`/api/files/${file.name}`, {
            method: "DELETE"
          })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              loadFiles(); // 목록 새로고침
            } else {
              alert("삭제 실패");
            }
          });
        };

        fileList.appendChild(li);
      });
    });
}

loadFiles();