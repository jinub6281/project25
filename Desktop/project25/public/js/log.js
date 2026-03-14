async function loadLogs() {
  const res = await fetch("/api/logs");
  const logs = await res.json();

  const logList = document.getElementById("logList");
  logList.innerHTML = "";

  if (logs.length === 0) {
    logList.innerHTML = "<p>로그가 없습니다.</p>";
    return;
  }

  logs.forEach(line => {
    const div = document.createElement("div");
    div.className = "log-item";
    div.textContent = line;
    logList.appendChild(div);
  });
}

loadLogs();