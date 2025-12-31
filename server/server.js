// ---------------- Imports ----------------
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ---------------- ES Module Fix ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------- Express Setup ----------------
const app = express();
app.use(cors());
app.use(express.json()); // ✅ REQUIRED
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------- MySQL Connection ----------------
let db;

function connectDB() {
  db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "awd",
    port: 3306,
  });

  db.connect((err) => {
    if (err) {
      console.error("❌ MySQL connection failed:", err.code);
      setTimeout(connectDB, 5000);
    } else {
      console.log("✅ Connected to MySQL");
    }
  });

  db.on("error", (err) => {
    if (
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      err.code === "ECONNREFUSED"
    ) {
      connectDB();
    } else {
      throw err;
    }
  });
}

connectDB();

// ---------------- Multer (PDF only) ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"), false);
    }
    cb(null, true);
  },
});

// ---------------- Health ----------------
app.get("/", (req, res) => res.send("Server running 🚀"));

// ---------------- Auth ----------------
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;
  const sql =
    "INSERT INTO user (fname, lname, email, password) VALUES (?, ?, ?, ?)";
  db.query(sql, [fname, lname, email, password], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ success: true });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = `
    SELECT id, fname, lname, email
    FROM user
    WHERE email = ? AND password = ?
  `;
  db.query(sql, [email, password], (err, results) => {
    if (results.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const u = results[0];
    res.json({
      userId: u.id,
      name: `${u.fname} ${u.lname}`,
      email: u.email,
    });
  });
});

// ---------------- Upload Note ----------------
app.post("/notes", upload.single("upload_file"), (req, res) => {
  const { title, description, subject, email } = req.body;
  const fileName = req.file?.filename;

  if (!title || !subject || !email || !fileName) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  const sql = `
    INSERT INTO notes
    (title, description, subject, email, upload_file, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [title, description, subject, email, fileName],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: result.insertId,
        title,
        description,
        subject,
        email,
        upload_file: fileName,
        url: `http://localhost:5000/uploads/${fileName}`,
      });
    }
  );
});

// ---------------- Get Notes ----------------
app.get("/notes", (req, res) => {
  const sql = `
    SELECT 
      id,title,description,subject,email,upload_file,
      likes_count,downloads_count,avg_rating,created_at,
      CONCAT('http://localhost:5000/uploads/', upload_file) AS url
    FROM notes
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ---------------- Like (SAFE) ----------------
app.post("/notes/:id/like", (req, res) => {
  const { id } = req.params;
  const email = req.body?.email;

  if (!email) {
    return res.status(401).json({ message: "Login required" });
  }

  const checkSql =
    "SELECT id FROM note_likes WHERE note_id = ? AND user_email = ?";

  db.query(checkSql, [id, email], (err, rows) => {
    if (rows.length > 0)
      return res.status(400).json({ message: "Already liked" });

    db.query(
      "INSERT INTO note_likes (note_id, user_email) VALUES (?, ?)",
      [id, email],
      () => {
        db.query(
          "UPDATE notes SET likes_count = likes_count + 1 WHERE id = ?",
          [id]
        );
        res.json({ success: true });
      }
    );
  });
});

// ---------------- Download (SAFE) ----------------
app.post("/notes/:id/download", (req, res) => {
  const { id } = req.params;
  const email = req.body?.email;

  if (!email) {
    return res.status(401).json({ message: "Login required" });
  }

  db.query(
    "UPDATE notes SET downloads_count = downloads_count + 1 WHERE id = ?",
    [id],
    () => res.json({ success: true })
  );
});

// ---------------- Rate (SAFE) ----------------
app.post("/notes/:id/rate", (req, res) => {
  const { id } = req.params;
  const email = req.body?.email;
  const rating = req.body?.rating;

  if (!email) {
    return res.status(401).json({ message: "Login required" });
  }

  const sql = `
    INSERT INTO note_ratings (note_id, user_email, rating)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
  `;

  db.query(sql, [id, email, rating], () => {
    const avgSql = `
      UPDATE notes
      SET avg_rating = (
        SELECT ROUND(AVG(rating), 1)
        FROM note_ratings
        WHERE note_id = ?
      )
      WHERE id = ?
    `;
    db.query(avgSql, [id, id]);
    res.json({ success: true });
  });
});

// ---------------- Start ----------------
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
