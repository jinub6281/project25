const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const progressBar = document.getElementById("progressBar");
const result = document.getElementById("result");

form.addEventListener("submit", e => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert("파일을 선택하세요");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/upload");

  xhr.upload.onprogress = e => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100;
      progressBar.style.width = percent + "%";
    }
  };

  xhr.onload = () => {
    const data = JSON.parse(xhr.responseText);

    if (data.success) {
      result.innerHTML = `
        업로드 완료 :
        <a href="${data.url}" target="_blank">${data.original}</a>
      `;
      progressBar.style.width = "0%";
      form.reset();
    } else {
      alert("업로드 실패");
    }
  };

  xhr.send(formData);
});