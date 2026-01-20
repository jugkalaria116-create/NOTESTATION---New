// ================= IMPORTS =================
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ================= ES MODULE FIX =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    console.error("❌ MySQL error:", err);
    process.exit(1);
  }
  console.log("✅ MySQL connected");
});
// ================= ADMIN DASHBOARD STATS =================
app.get("/admin/dashboard", (req, res) => {
  const stats = {};

  // 1️⃣ Total users
  db.query("SELECT COUNT(*) AS users FROM user", (err, r1) => {
    if (err) return res.status(500).json(err);
    stats.users = r1[0].users;

    // 2️⃣ Total notes
    db.query("SELECT COUNT(*) AS notes FROM notes", (err, r2) => {
      if (err) return res.status(500).json(err);
      stats.notes = r2[0].notes;

      // 3️⃣ Total downloads
      db.query(
        "SELECT IFNULL(SUM(downloads_count), 0) AS downloads FROM notes",
        (err, r3) => {
          if (err) return res.status(500).json(err);
          stats.downloads = r3[0].downloads;

          // 4️⃣ Total contact messages
          db.query(
            "SELECT COUNT(*) AS messages FROM contact",
            (err, r4) => {
              if (err) return res.status(500).json(err);
              stats.messages = r4[0].messages;

              // ✅ Final response
              res.json(stats);
            }
          );
        }
      );
    });
  });
});
// ================= CONTACT FORM =================
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO contact (Name, Email, Subject, contact_messages)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) {
      console.error("❌ Contact insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    logAdmin("📩 New contact message");
    res.status(201).json({ success: true, message: "Message sent successfully" });
  });
});
// ================= ADMIN CONTACT MESSAGES =================
app.get("/admin/contact-messages", (req, res) => {
  const sql = `
    SELECT
      id,
      Name AS name,
      Email AS email,
      Subject AS subject,
      contact_messages AS message,
      created_at
    FROM contact
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Contact fetch error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ================= ADMIN DELETE CONTACT MESSAGE =================
app.delete("/admin/contact-messages/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM contact WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("❌ Delete contact error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!result.affectedRows) {
        return res.status(404).json({ error: "Message not found" });
      }

      logAdmin("🗑️ Contact message deleted");
      res.json({ success: true });
    }
  );
});


// ================= HELPERS =================
const logAdmin = (action) => {
  db.query("INSERT INTO admin_activity (action) VALUES (?)", [action]);
};

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({ message: "🚀 Server running" });
});

// ================= USERS =================
app.get("/users", (req, res) => {
  db.query(
    "SELECT id, fname, lname, email FROM user",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// ================= AUTH =================
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;
  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.query(
    "SELECT id FROM user WHERE email = ?",
    [email],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (r.length)
        return res.status(409).json({ error: "Email already registered" });

      db.query(
        "INSERT INTO user (fname, lname, email, password) VALUES (?, ?, ?, ?)",
        [fname, lname, email, password],
        (err) => {
          if (err) return res.status(500).json(err);
          logAdmin("👤 New user registered");
          res.json({ success: true });
        }
      );
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT fname, lname, email FROM user WHERE email=? AND password=?",
    [email, password],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (!r.length)
        return res.status(401).json({ error: "Invalid credentials" });

      res.json({
        name: `${r[0].fname} ${r[0].lname}`,
        email: r[0].email,
        role: "client",
      });
    }
  );
});

// ================= FILE UPLOAD =================
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const dir = path.join(__dirname, "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (_, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  },
});

// ================= CREATE NOTE =================
app.post("/notes", upload.single("upload_file"), (req, res) => {
  const { title, description, subject, email } = req.body;

  const sql = `
    INSERT INTO notes
    (title, description, subject, Email, upload_file,
     likes_count, downloads_count, avg_rating,
     visibility, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 0, 0, 'private', NOW())
  `;

  db.query(
    sql,
    [title, description, subject, email, req.file.filename],
    (err) => {
      if (err) return res.status(500).json(err);
      logAdmin("📄 New note uploaded");
      res.json({ success: true });
    }
  );
});

// ================= PUBLIC NOTES =================
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
    WHERE visibility='public' AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;
  db.query(sql, (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});

// ================= MY NOTES =================
app.get("/notes/my/:email", (req, res) => {
  const sql = `
    SELECT
      ID AS id,
      title,
      description,
      subject,
      Email AS email,
      visibility,
      likes_count,
      downloads_count,
      created_at,
      CONCAT('http://localhost:5000/uploads/', upload_file) AS url
    FROM notes
    WHERE LOWER(Email)=LOWER(?) AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;
  db.query(sql, [req.params.email], (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});

// ================= LIKE =================
app.post("/notes/:id/like", (req, res) => {
  const { userEmail } = req.body;
  const id = req.params.id;

  db.query(
    "INSERT IGNORE INTO note_likes (note_id, user_email, created_at) VALUES (?, ?, NOW())",
    [id, userEmail],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (r.affectedRows)
        db.query(
          "UPDATE notes SET likes_count = likes_count + 1 WHERE ID=?",
          [id]
        );
      res.json({ success: true });
    }
  );
});

// ================= DOWNLOAD =================
app.post("/notes/:id/download", (req, res) => {
  const { userEmail } = req.body;
  const id = req.params.id;

  db.query(
    "INSERT IGNORE INTO note_downloads (note_id, user_email) VALUES (?, ?)",
    [id, userEmail],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (r.affectedRows) {
        db.query(
          "UPDATE notes SET downloads_count = downloads_count + 1 WHERE ID=?",
          [id]
        );
        logAdmin("⬇️ Note downloaded");
      }
      res.json({ success: true });
    }
  );
});

// ================= VISIBILITY =================
app.patch("/notes/toggle-visibility/:id", (req, res) => {
  db.query(
    "UPDATE notes SET visibility=? WHERE ID=?",
    [req.body.visibility, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ================= TRASH =================
app.patch("/notes/trash/:id", (req, res) => {
  const { email } = req.body;

  db.query(
    "UPDATE notes SET deleted_at=NOW() WHERE ID=? AND LOWER(Email)=LOWER(?)",
    [req.params.id, email],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (!r.affectedRows)
        return res.status(403).json({ error: "Not allowed" });
      res.json({ success: true });
    }
  );
});

app.get("/notes/trash/:email", (req, res) => {
  db.query(
    `
    SELECT ID AS id, title, description, deleted_at
    FROM notes
    WHERE LOWER(Email)=LOWER(?) AND deleted_at IS NOT NULL
    ORDER BY deleted_at DESC
    `,
    [req.params.email],
    (err, r) => {
      if (err) return res.status(500).json(err);
      res.json(r);
    }
  );
});

app.patch("/notes/restore/:id", (req, res) => {
  const { email } = req.body;

  db.query(
    "UPDATE notes SET deleted_at=NULL WHERE ID=? AND LOWER(Email)=LOWER(?)",
    [req.params.id, email],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (!r.affectedRows)
        return res.status(403).json({ error: "Not allowed" });
      res.json({ success: true });
    }
  );
});

app.delete("/notes/permanent/:id", (req, res) => {
  db.query(
    "DELETE FROM notes WHERE ID=?",
    [req.params.id],
    (err, r) => {
      if (err) return res.status(500).json(err);
      if (!r.affectedRows)
        return res.status(404).json({ error: "Note not found" });

      logAdmin("🗑️ Note permanently deleted by admin");
      res.json({ success: true });
    }
  );
});


// ================= CLIENT DASHBOARD =================
app.get("/user/notes/:email", (req, res) => {
  db.query(
    "SELECT COUNT(*) AS totalNotes FROM notes WHERE LOWER(Email)=LOWER(?) AND deleted_at IS NULL",
    [req.params.email],
    (err, r) => {
      if (err) return res.status(500).json(err);
      res.json({ totalNotes: r[0].totalNotes });
    }
  );
});

app.get("/user/likes/:email", (req, res) => {
  const sql = `
    SELECT COUNT(l.id) AS totalLikes
    FROM note_likes l
    JOIN notes n ON n.ID = l.note_id
    WHERE LOWER(n.Email)=LOWER(?) AND n.deleted_at IS NULL
  `;
  db.query(sql, [req.params.email], (err, r) => {
    if (err) return res.status(500).json(err);
    res.json({ totalLikes: r[0].totalLikes });
  });
});

app.get("/user/downloads/:email", (req, res) => {
  const sql = `
    SELECT COUNT(d.id) AS totalDownloads
    FROM note_downloads d
    JOIN notes n ON n.ID = d.note_id
    WHERE LOWER(n.Email)=LOWER(?)
  `;
  db.query(sql, [req.params.email], (err, r) => {
    if (err) return res.status(500).json(err);
    res.json({ totalDownloads: r[0].totalDownloads });
  });
});

app.get("/user/notes/visibility/:email", (req, res) => {
  const sql = `
    SELECT
      SUM(CASE WHEN visibility='private' THEN 1 ELSE 0 END) AS privateNotes,
      SUM(CASE WHEN visibility='public' THEN 1 ELSE 0 END) AS publicNotes
    FROM notes
    WHERE LOWER(Email)=LOWER(?) AND deleted_at IS NULL
  `;
  db.query(sql, [req.params.email], (err, r) => {
    if (err) return res.status(500).json(err);
    res.json({
      private: r[0].privateNotes || 0,
      public: r[0].publicNotes || 0,
    });
  });
});

// ================= ADMIN DASHBOARD =================
app.get("/admin/chart/notes-per-user", (req, res) => {
  const sql = `
    SELECT 
      CONCAT(u.fname,' ',u.lname) AS user,
      COUNT(n.ID) AS totalNotes
    FROM user u
    LEFT JOIN notes n ON LOWER(u.email)=LOWER(n.Email)
    GROUP BY u.email
    ORDER BY totalNotes DESC
  `;
  db.query(sql, (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});

app.get("/admin/chart/downloads-per-day", (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS day, COUNT(*) AS totalDownloads
    FROM note_downloads
    GROUP BY DATE(created_at)
    ORDER BY day ASC
    LIMIT 14
  `;
  db.query(sql, (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});

// ================= 404 JSON =================
app.use((req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// ================= START SERVER =================
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
