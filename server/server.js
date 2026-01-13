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
  db.query("SELECT id, fname, lname, email FROM user", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;

  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query("SELECT id FROM user WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0)
      return res.status(409).json({ error: "Email already registered" });

    db.query(
      "INSERT INTO user (fname, lname, email, password) VALUES (?, ?, ?, ?)",
      [fname, lname, email, password],
      (err) => {
        if (err) return res.status(500).json(err);

        db.query(
          "INSERT INTO admin_activity (action) VALUES (?)",
          ["👤 New user registered"]
        );

        res.json({ success: true });
      }
    );
  });
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
    (title, description, subject, Email, upload_file, likes_count, downloads_count, avg_rating, visibility, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, 'private', NOW())
  `;

  db.query(sql, [title, description, subject, email, fileName], (err) => {
    if (err) return res.status(500).json(err);

    db.query(
      "INSERT INTO admin_activity (action) VALUES (?)",
      ["📄 New note uploaded"]
    );

    res.json({ success: true });
  });
});

// ================= FETCH NOTES =================
app.get("/notes", (req, res) => {
  const sql = `
    SELECT
      ID AS id,
      title,
      description,
      subject,
      Email,
      upload_file,
      visibility,
      likes_count,
      downloads_count,
      avg_rating,
      created_at,
      CONCAT('http://localhost:5000/uploads/', upload_file) AS url
    FROM notes
    WHERE visibility = 'public'
    ORDER BY created_at DESC
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

  db.query(
    "INSERT IGNORE INTO note_likes (note_id, user_email, created_at) VALUES (?, ?, NOW())",
    [noteId, userEmail],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows > 0) {
        db.query(
          "UPDATE notes SET likes_count = likes_count + 1 WHERE ID = ?",
          [noteId]
        );
      }
      res.json({ success: true });
    }
  );
});

// ================= DOWNLOAD NOTE =================
app.post("/notes/:id/download", (req, res) => {
  const { userEmail } = req.body;
  const noteId = req.params.id;

  db.query(
    "INSERT IGNORE INTO note_downloads (note_id, user_email) VALUES (?, ?)",
    [noteId, userEmail],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows > 0) {
        db.query(
          "UPDATE notes SET downloads_count = downloads_count + 1 WHERE ID = ?",
          [noteId]
        );

        db.query(
          "INSERT INTO admin_activity (action) VALUES (?)",
          ["⬇️ Note downloaded"]
        );
      }
      res.json({ success: true });
    }
  );
});

// ================= TOGGLE PUBLIC / PRIVATE =================
app.patch("/notes/toggle-visibility/:id", (req, res) => {
  const { visibility } = req.body;
  const noteId = req.params.id;

  db.query(
    "UPDATE notes SET visibility = ? WHERE ID = ?",
    [visibility, noteId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ================= MY NOTES (FIXED POSITION) =================
app.get("/notes/my/:email", (req, res) => {
  const sql = `
    SELECT
      ID AS id,
      title,
      description,
      subject,
      visibility,
      likes_count,
      downloads_count,
      created_at,
      CONCAT('http://localhost:5000/uploads/', upload_file) AS url
    FROM notes
    WHERE LOWER(Email) = LOWER(?)
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ================= USER DASHBOARD STATS =================
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

app.get("/user/likes/:email", (req, res) => {
  const sql = `
    SELECT COUNT(l.id) AS totalLikes
    FROM note_likes l
    JOIN notes n ON n.ID = l.note_id
    WHERE LOWER(n.Email) = LOWER(?)
  `;
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalLikes: result[0].totalLikes });
  });
});

app.get("/user/downloads/:email", (req, res) => {
  const sql = `
    SELECT COUNT(d.id) AS totalDownloads
    FROM note_downloads d
    JOIN notes n ON n.ID = d.note_id
    WHERE LOWER(n.Email) = LOWER(?)
  `;
  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ totalDownloads: result[0].totalDownloads });
  });
});

// ================= DAILY LIKES =================
app.get("/user/likes-daily/:email", (req, res) => {
  const sql = `
    SELECT DATE(l.created_at) AS day, COUNT(*) AS totalLikes
    FROM note_likes l
    JOIN notes n ON n.ID = l.note_id
    WHERE LOWER(n.Email) = LOWER(?)
    GROUP BY DATE(l.created_at)
    ORDER BY day DESC
    LIMIT 7
  `;

  db.query(sql, [req.params.email], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result.reverse());
  });
});
app.patch("/notes/toggle-visibility/:id", (req, res) => {
  console.log("TOGGLE HIT:", req.params.id, req.body.visibility);

  const { visibility } = req.body;
  const noteId = req.params.id;

  db.query(
    "UPDATE notes SET visibility = ? WHERE ID = ?",
    [visibility, noteId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});


// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
