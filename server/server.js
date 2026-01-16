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
    WHERE visibility = 'public'AND deleted_at IS NULL
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

// ================= MY NOTES =================
app.get("/notes/my/:email", (req, res) => {
  const sql = `
    SELECT
      ID AS id,
      title,
      description,
      subject,
      Email AS email,   -- 🔥 THIS IS REQUIRED
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
// ================= DELETE NOTE (OWNER ONLY) =================
app.delete("/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.query(
    "SELECT upload_file, Email FROM notes WHERE ID = ?",
    [noteId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ error: "Note not found" });
      }

      const note = result[0];

      if (note.Email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({
          error: "You are not allowed to delete this note",
        });
      }

      const filePath = path.join(__dirname, "uploads", note.upload_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      db.query("DELETE FROM notes WHERE ID = ?", [noteId], (err) => {
        if (err) return res.status(500).json(err);

        res.json({ success: true });
      });
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
    WHERE LOWER(n.Email) = LOWER(?) AND deleted_at IS NULL
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

          // 4️⃣ Total messages (FIXED TABLE NAME)
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
// ================= ADMIN CHART: NOTES PER USER =================
app.get("/admin/chart/notes-per-user", (req, res) => {
  const sql = `
    SELECT 
      CONCAT(u.fname, ' ', u.lname) AS user,
      COUNT(n.ID) AS totalNotes
    FROM user u
    LEFT JOIN notes n ON LOWER(u.email) = LOWER(n.Email)
    GROUP BY u.email
    ORDER BY totalNotes DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});
// ================= ADMIN CHART: DOWNLOADS PER DAY =================
app.get("/admin/chart/downloads-per-day", (req, res) => {
  const sql = `
    SELECT 
      DATE(created_at) AS day,
      COUNT(*) AS totalDownloads
    FROM note_downloads
    GROUP BY DATE(created_at)
    ORDER BY day ASC
    LIMIT 14
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});
// ================= CONTACT FORM =================
app.post("/contact", (req, res) => {
  console.log("CONTACT BODY:", req.body); // 🔍 debug

  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    INSERT INTO \`contact\`
    (\`Name\`, \`Email\`, \`Subject\`, \`contact_messages\`)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, subject, message], (err, result) => {
    if (err) {
      console.error("❌ CONTACT INSERT ERROR:", err.sqlMessage || err);
      return res.status(500).json({
        error: "Database insert failed",
        details: err.sqlMessage
      });
    }

    res.json({
      success: true,
      message: "Message sent successfully"
    });
  });
});
// ================= ADMIN: VIEW CONTACT MESSAGES =================
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
    ORDER BY Created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ FETCH CONTACT ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});
// ================= PRIVATE / PUBLIC NOTES COUNT (FIXED) =================
app.get("/user/notes/visibility/:email", (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT
      SUM(CASE WHEN visibility = 'private' THEN 1 ELSE 0 END) AS privateNotes,
      SUM(CASE WHEN visibility = 'public' THEN 1 ELSE 0 END) AS publicNotes
    FROM notes
    WHERE LOWER(Email) = LOWER(?)
  `;

  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("❌ VISIBILITY SQL ERROR:", err);
      return res.status(500).json(err);
    }

    res.json({
      private: result[0]?.privateNotes || 0,
      public: result[0]?.publicNotes || 0
    });
  });
});
// ================= DELETE NOTE (OWNER ONLY) =================
app.delete("/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const { email } = req.body; // owner email from frontend

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // 1️⃣ Fetch note to verify ownership
  db.query(
    "SELECT upload_file, Email FROM notes WHERE ID = ?",
    [noteId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ error: "Note not found" });
      }

      const note = result[0];

      // 2️⃣ OWNER CHECK
      if (note.Email.toLowerCase() !== email.toLowerCase()) {
        return res.status(403).json({
          error: "You are not allowed to delete this note",
        });
      }

      // 3️⃣ Delete file from uploads
      const filePath = path.join(__dirname, "uploads", note.upload_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // 4️⃣ Delete note from DB
      db.query(
        "DELETE FROM notes WHERE ID = ?",
        [noteId],
        (err) => {
          if (err) return res.status(500).json(err);

          // 5️⃣ Admin log
          db.query(
            "INSERT INTO admin_activity (action) VALUES (?)",
            ["🗑 Note deleted"]
          );

          res.json({ success: true });
        }
      );
    }
  );
});
// ================= MOVE NOTE TO TRASH =================
app.patch("/notes/trash/:id", (req, res) => {
  const noteId = req.params.id;
  const { email } = req.body;

  db.query(
    `UPDATE notes
     SET deleted_at = NOW()
     WHERE ID = ? AND LOWER(Email) = LOWER(?)`,
    [noteId, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(403).json({ error: "Not allowed" });
      }
      res.json({ success: true });
    }
  );
});
// ================= FETCH TRASH =================
app.get("/notes/trash/:email", (req, res) => {
  db.query(
    `SELECT
      ID AS id,
      title,
      description,
      deleted_at
     FROM notes
     WHERE LOWER(Email) = LOWER(?)
       AND deleted_at IS NOT NULL
     ORDER BY deleted_at DESC`,
    [req.params.email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});
// ================= RESTORE NOTE =================
app.patch("/notes/restore/:id", (req, res) => {
  const noteId = req.params.id;
  const { email } = req.body;

  db.query(
    `UPDATE notes
     SET deleted_at = NULL
     WHERE ID = ? AND LOWER(Email) = LOWER(?)`,
    [noteId, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(403).json({ error: "Not allowed" });
      }
      res.json({ success: true });
    }
  );
});
// ================= DELETE NOTE PERMANENTLY =================
app.delete("/notes/permanent/:id", (req, res) => {
  const noteId = req.params.id;
  const { email } = req.body;

  db.query(
    "DELETE FROM notes WHERE ID = ? AND LOWER(Email) = LOWER(?)",
    [noteId, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.affectedRows === 0) {
        return res.status(403).json({ error: "Not allowed" });
      }
      res.json({ success: true });
    }
  );
});


// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
