// ================= IMPORTS =================
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ================= ES MODULE FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ================= APP SETUP =================
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= MYSQL CONNECTION =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "awd",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected");
});

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🚀 Server running");
});

// ================= USERS =================
app.get("/users", (req, res) => {
  const sql = "SELECT id, fname, lname, email FROM user";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.delete("/users/:id", (req, res) => {
  db.query("DELETE FROM user WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ success: result.affectedRows > 0 });
  });
});

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;

  db.query("SELECT id FROM user WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    db.query(
      "INSERT INTO user (fname, lname, email, password) VALUES (?, ?, ?, ?)",
      [fname, lname, email, password],
      (err) => {
        if (err) return res.status(500).json({ error: "Server error" });
        res.json({ message: "Registration successful" });
      }
    );
  });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT id, fname, lname, email FROM user WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const u = results[0];
      res.json({
        userId: u.id,
        name: `${u.fname} ${u.lname}`,
        email: u.email,
      });
    }
  );
});

// ================= CONTACT =================
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  const sql = `
    INSERT INTO contact (Name, Email, Subject, contact_messages, Created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ================= FILE UPLOAD =================
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
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  },
});

// ================= NOTES UPLOAD =================
app.post("/notes", upload.single("upload_file"), (req, res) => {
  const { title, description, subject, email } = req.body;
  const fileName = req.file.filename;

  const sql = `
    INSERT INTO notes (title, description, subject, email, upload_file, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [title, description, subject, email, fileName], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ================= NOTES FETCH (LIKES + RATINGS + DOWNLOADS) =================
app.get("/notes", (req, res) => {
  const sql = `
    SELECT
      n.*,

      -- PDF URL
      CONCAT('http://localhost:5000/uploads/', n.upload_file) AS url,

      -- TOTAL LIKES
      (
        SELECT COUNT(*)
        FROM note_likes nl
        WHERE nl.note_id = n.id
      ) AS likes,

      -- AVERAGE RATING
      (
        SELECT ROUND(AVG(nr.rating), 1)
        FROM note_ratings nr
        WHERE nr.note_id = n.id
      ) AS rating,

      -- TOTAL DOWNLOADS (if column exists)
      IFNULL(n.downloads_count, 0) AS downloads_count

    FROM notes n
    ORDER BY n.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ NOTES FETCH ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// ================= LIKE NOTE =================
app.post("/notes/:id/like", (req, res) => {
  const { userEmail } = req.body;
  const noteId = req.params.id;

  const sql = `
    INSERT IGNORE INTO note_likes (note_id, user_email, created_at)
    VALUES (?, ?, NOW())
  `;

  db.query(sql, [noteId, userEmail], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ================= RATE NOTE =================
app.post("/notes/:id/rate", (req, res) => {
  const { userEmail, rating } = req.body;
  const noteId = req.params.id;

  const sql = `
    INSERT INTO note_ratings (note_id, user_email, rating, created_at)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE rating = ?, created_at = NOW()
  `;

  db.query(sql, [noteId, userEmail, rating, rating], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
