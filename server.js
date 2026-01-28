const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const app = express();
const requireLogin = require("./middleware/auth");

/* ===============================
   기본 설정
================================ */
app.set("trust proxy", 1);
app.use(cors({
  origin: true,          // 현재 도메인 허용
  credentials: true      // 🔥 쿠키 허용
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use(session({
  name: "admin-session",
  secret: "PXHV3LP8WY6CmsHzrfeIpEMAe8GeQzPkFKe6DSIJ0GICZUFxxzri9dU0jtmQALBc",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,     // HTTPS
    sameSite: "none"  // 🔥 Cloudflare 필수
  }
}));

app.use((req, res, next) => {
  console.log(req.ip, req.headers.host);
  next();
});



// 라우트
app.get("/", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "app_pages/index.html"));
});

app.get("/dashboard", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "app_pages/dashboard.html"));
});

app.get("/admin", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "app_pages/admin.html"));
});

app.get("/createadmin", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "app_pages/createadmin.html"));
});

app.get("/files", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "app_pages/files.html"));
});

app.get("/log", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "app_pages/log.html"));
});

app.get("/index.html", (req, res) => {
  res.status(404).end();
});



/* ===============================
   폴더 준비
================================ */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

const logFilePath = path.join(__dirname, "logs", "upload.log");

/* ===============================
   DB 설정
================================ */
const dbconfig = {
  host: "localhost",
  user: "root",
  password: "wlsdn",
  database: "userdb"
};

/* ===============================
   파일 목록 API
================================ */
app.get("/api/files", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json({ success: false });

    const list = files.map(filename => {
      const stat = fs.statSync(path.join("uploads", filename));
      return {
        name: filename,
        url: `/api/uploads/${filename}`,
        size: stat.size,
        created: stat.birthtime
      };
    });

    res.json(list);
  });
});

/* ===============================
   파일 업로드 설정
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + "-" + Math.random().toString(36).slice(2);
    cb(null, safeName + ext);
  }
});

const upload = multer({ storage });

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

/* ===============================
   로그인
================================ */
app.post("/login", async (req, res) => {
  const { id, pw } = req.body;
  let conn;

  try {
    conn = await mysql.createConnection(dbconfig);
    const [rows] = await conn.execute(
      "SELECT * FROM admin WHERE username = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.json({ success: false });
    }

    const match = await bcrypt.compare(pw, rows[0].password);
    if (!match) {
      return res.json({ success: false });
    }
    // 로그인 성공 시
    req.session.login = true;
    req.session.username = id;
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) await conn.end();
  }
});

/* ===============================
   파일 업로드 API + 로그
================================ */
app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.json({ success: false });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbconfig);

    await conn.execute(
      "INSERT INTO uploads (original_name, saved_name) VALUES (?, ?)",
      [req.file.originalname, req.file.filename]
    );

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);

    const logLine =
      `[${new Date().toISOString().replace("T", " ").slice(0, 19)}] ` +
      `UPLOAD ip=${ip} size=${sizeMB}MB ` +
      `original=${req.file.originalname} saved=${req.file.filename}\n`;

    fs.appendFileSync(logFilePath, logLine);

    res.json({
      success: true,
      filename: req.file.filename,
      original: req.file.originalname,
      url: `/api/uploads/${req.file.filename}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) await conn.end();
  }
});

/* ===============================
   파일 삭제 API + 삭제 로그 ⭐
================================ */
app.delete("/api/files/:filename", (req, res) => {
  const filename = req.params.filename;

  if (filename.includes("..")) {
    return res.status(400).json({ success: false });
  }

  const filePath = path.join(__dirname, "uploads", filename);

  fs.stat(filePath, (err, stat) => {
    if (err) {
      return res.status(404).json({ success: false });
    }

    fs.unlink(filePath, err => {
      if (err) {
        return res.status(500).json({ success: false });
      }

      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress;

      const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

      const logLine =
        `[${new Date().toISOString().replace("T", " ").slice(0, 19)}] ` +
        `DELETE ip=${ip} size=${sizeMB}MB file=${filename}\n`;

      fs.appendFileSync(logFilePath, logLine);

      res.json({ success: true });
    });
  });
});

app.get("/api/admins", async (req, res) => {
  const conn = await mysql.createConnection(dbconfig);
  const [rows] = await conn.execute(
    "SELECT username FROM admin"
  );
  await conn.end();
  res.json(rows);
});

/* ===============================
   관리자 계정 생성 API
================================ */
app.post("/api/admin/create", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, error: "값이 부족합니다" });
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbconfig);

    // 중복 체크
    const [rows] = await conn.execute(
      "SELECT id FROM admin WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      return res.json({ success: false, error: "이미 존재하는 관리자입니다" });
    }

    // 비밀번호 해시
    const hash = await bcrypt.hash(password, 10);

    // 관리자 추가
    await conn.execute(
      "INSERT INTO admin (username, password) VALUES (?, ?)",
      [username, hash]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "서버 오류" });
  } finally {
    if (conn) await conn.end();
  }
});

// 관리자 삭제

app.delete("/api/admin/delete/:username", async (req, res) => {
  const username = req.params.username;

  let conn;
  try {
    conn = await mysql.createConnection(dbconfig);

    const [rows] = await conn.execute(
      "SELECT username FROM admin WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.json({ success: false, error: "존재하지 않는 관리자" });
    }

    await conn.execute(
      "DELETE FROM admin WHERE username = ?",
      [username]
    );

    // 로그
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    fs.appendFileSync(
      "admin.log",
      `[${new Date().toISOString().slice(0,19).replace("T"," ")}] ` +
      `ADMIN DELETE username=${username} ip=${ip}\n`
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) await conn.end();
  }
});

/* ===============================
   관리자 목록 API
================================ */
app.get("/api/admin/list", async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(dbconfig);

    const [rows] = await conn.execute(
      "SELECT id, username FROM admin ORDER BY id ASC"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  } finally {
    if (conn) await conn.end();
  }
});

/* ===============================
   관리자 비밀번호 재설정
================================ */
app.post("/api/admin/reset-password", async (req, res) => {
  const { username, newPw } = req.body;
  let conn;

  try {
    const hashed = await bcrypt.hash(newPw, 10);
    conn = await mysql.createConnection(dbconfig);

    await conn.execute(
      "UPDATE admin SET password = ? WHERE username = ?",
      [hashed, username]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) await conn.end();
  }
});
/* ===============================
   로그 조회 API
================================ */
app.get("/api/logs", (req, res) => {
  const logPath = path.join(__dirname, "logs", "upload.log");

  if (!fs.existsSync(logPath)) {
    return res.json([]);
  }

  fs.readFile(logPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ success: false });
    }

    const lines = data
      .trim()
      .split("\n")
      .reverse(); // 최신 로그 위로

    res.json(lines);
  });
});

/* ===============================
   서버 실행
================================ */
app.listen(80, "0.0.0.0", () => {
  console.log("서버 실행중 (외부 접속 가능)");
});