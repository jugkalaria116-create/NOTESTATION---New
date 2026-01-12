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

        // 🔔 ACTIVITY LOG
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
    (title, description, subject, Email, upload_file, likes_count, downloads_count, avg_rating, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, NOW())
  `;

  db.query(sql, [title, description, subject, email, fileName], (err) => {
    if (err) return res.status(500).json(err);

    // 🔔 ACTIVITY LOG
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
      n.ID AS id,
      n.title,
      n.description,
      n.subject,
      n.Email,
      n.upload_file,
      n.likes_count,
      n.downloads_count,
      n.avg_rating,
      n.created_at,
      CONCAT('http://localhost:5000/uploads/', n.upload_file) AS url
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

        // 🔔 ACTIVITY LOG
        db.query(
          "INSERT INTO admin_activity (action) VALUES (?)",
          ["⬇️ Note downloaded"]
        );
      }
      res.json({ success: true });
    }
  );
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

// ================= ADMIN DASHBOARD =================
app.get("/admin/dashboard", (req, res) => {
  const data = {};

  db.query("SELECT COUNT(*) AS count FROM user", (err, u) => {
    if (err) return res.status(500).json(err);
    data.users = u[0].count;

    db.query("SELECT COUNT(*) AS count FROM notes", (err, n) => {
      if (err) return res.status(500).json(err);
      data.notes = n[0].count;

      db.query("SELECT COUNT(*) AS count FROM note_downloads", (err, d) => {
        if (err) return res.status(500).json(err);
        data.downloads = d[0].count;

        db.query("SELECT COUNT(*) AS count FROM contact", (err, m) => {
          if (err) return res.status(500).json(err);
          data.messages = m[0].count;

          res.json(data);
        });
      });
    });
  });
});

// ================= ADMIN - RECENT ACTIVITY =================
app.get("/admin/recent-activity", (req, res) => {
  db.query(
    "SELECT action, created_at FROM admin_activity ORDER BY id DESC LIMIT 5",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// ================= ADMIN - CONTACT MESSAGES =================
app.get("/admin/contact-messages", (req, res) => {
  const sql = `
    SELECT
      id,
      Name AS name,
      Email AS email,
      Subject AS subject,
      contact_messages AS message,
      Created_at AS date
    FROM contact
    ORDER BY id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ================= ADMIN - DELETE CONTACT MESSAGE =================
app.delete("/admin/contact-messages/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM contact WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Message not found" });

    res.json({ success: true });
  });
});
// ================= ADMIN - NOTES PER USER =================
app.get("/admin/chart/notes-per-user", (req, res) => {
  const sql = `
    SELECT Email AS user, COUNT(ID) AS totalNotes
    FROM notes
    GROUP BY Email
    ORDER BY totalNotes DESC
    LIMIT 10
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
// ================= ADMIN - DOWNLOADS PER DAY =================
app.get("/admin/chart/downloads-per-day", (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS day, COUNT(*) AS totalDownloads
    FROM note_downloads
    GROUP BY day
    ORDER BY day
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
