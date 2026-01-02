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
  res.json({ message: "🚀 Server running" });
});

// ================= USERS =================
app.get("/users", (req, res) => {
  db.query(
    "SELECT id, fname, lname, email FROM user",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;

  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // check if user already exists
  db.query(
    "SELECT id FROM user WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length > 0) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // insert user
      db.query(
        "INSERT INTO user (fname, lname, email, password) VALUES (?, ?, ?, ?)",
        [fname, lname, email, password],
        (err) => {
          if (err) return res.status(500).json(err);

          res.status(201).json({
            message: "Registration successful",
          });
        }
      );
    }
  );
});


// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT fname, lname, email FROM user WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const u = results[0];
      res.json({
        name: `${u.fname} ${u.lname}`,
        email: u.email,
        role: "client",
      });
    }
  );
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
    INSERT INTO notes
    (title, description, subject, Email, upload_file, likes_count, downloads_count, avg_rating, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, NOW())
  `;

  db.query(sql, [title, description, subject, email, fileName], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// ================= FETCH NOTES (LIKES + RATINGS + DOWNLOADS) =================
app.get("/notes", (req, res) => {
  const sql = `
    SELECT
      n.*,
      CONCAT('http://localhost:5000/uploads/', n.upload_file) AS url,

      (SELECT COUNT(*) FROM note_likes nl WHERE nl.note_id = n.id) AS likes,

      (SELECT ROUND(AVG(nr.rating),1)
       FROM note_ratings nr WHERE nr.note_id = n.id) AS rating,

      IFNULL(n.downloads_count, 0) AS downloads_count

    FROM notes n
    ORDER BY n.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
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

  db.query(sql, [noteId, userEmail], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows > 0) {
      db.query(
        "UPDATE notes SET likes_count = likes_count + 1 WHERE id = ?",
        [noteId]
      );
    }

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

    // update avg_rating
    db.query(
      `
      UPDATE notes
      SET avg_rating = (
        SELECT ROUND(AVG(rating),1)
        FROM note_ratings
        WHERE note_id = ?
      )
      WHERE id = ?
      `,
      [noteId, noteId]
    );

    res.json({ success: true });
  });
});

// ================= DOWNLOAD NOTE =================
app.post("/notes/:id/download", (req, res) => {
  const noteId = req.params.id;
  const { userEmail } = req.body;

  db.query(
    `
    INSERT IGNORE INTO note_downloads (note_id, user_email)
    VALUES (?, ?)
    `,
    [noteId, userEmail],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows > 0) {
        db.query(
          "UPDATE notes SET downloads_count = downloads_count + 1 WHERE id = ?",
          [noteId]
        );
      }

      res.json({ success: true });
    }
  );
});

// ================= USER DASHBOARD STATS =================

// notes uploaded by user
app.get("/user/notes/:email", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS totalNotes FROM notes WHERE LOWER(Email) = LOWER(?)",
    [req.params.email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ totalNotes: result[0].totalNotes });
    }
  );
});

// likes received on user notes
app.get("/user/likes/:email", (req, res) => {
  db.query(
    `
    SELECT IFNULL(SUM(likes_count),0) AS totalLikes
    FROM notes WHERE LOWER(Email) = LOWER(?)
    `,
    [req.params.email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ totalLikes: result[0].totalLikes });
    }
  );
});

// downloads received on user notes
app.get("/user/downloads/:email", (req, res) => {
  db.query(
    `
    SELECT IFNULL(SUM(downloads_count),0) AS totalDownloads
    FROM notes WHERE LOWER(Email) = LOWER(?)
    `,
    [req.params.email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ totalDownloads: result[0].totalDownloads });
    }
  );
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
