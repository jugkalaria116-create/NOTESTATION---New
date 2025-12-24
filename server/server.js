// ---------------- Imports ----------------
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ---------------- ES Module __dirname Fix ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------- Express Setup ----------------
const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
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
      console.log("🔄 Retrying connection in 5s...");
      setTimeout(connectDB, 5000);
    } else {
      console.log("✅ Connected to MySQL");
    }
  });

  db.on("error", (err) => {
    console.error("⚠️ MySQL error:", err.code);
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

// ---------------- Multer Config (PDF only) ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

// ---------------- Routes ----------------

// Health check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// ---------------- Users ----------------
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM user";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "DELETE FROM user WHERE id = ?";
  db.query(sql, [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User deleted successfully" });
  });
});

// ---------------- Register User ----------------
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;

  if (!fname || !lname || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql =
    "INSERT INTO user (fname, lname, email, password) VALUES (?, ?, ?, ?)";

  db.query(sql, [fname, lname, email, password], (err) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true, message: "User registered successfully!" });
  });
});

// ---------------- LOGIN (RETURNS NAME) ----------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = `
    SELECT id, fname, lname, email
    FROM user
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("❌ Login error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    res.json({
      userId: user.id,
      name: `${user.fname} ${user.lname}`, // ✅ NAME SENT
      email: user.email,
    });
  });
});

// ---------------- Notes (UPLOAD) ----------------
app.post("/notes", upload.single("upload_file"), (req, res) => {
  const { title, description, subject, email } = req.body;
  const fileName = req.file ? req.file.filename : null;

  if (!title || !subject || !email || !fileName) {
    return res.status(400).json({ error: "⚠️ Required fields missing!" });
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
        created_at: new Date(),
      });
    }
  );
});

// ---------------- Get Notes ----------------
app.get("/notes", (req, res) => {
  const sql = `
    SELECT 
      id,
      title,
      description,
      subject,
      email,
      upload_file,
      CONCAT('http://localhost:5000/uploads/', upload_file) AS url,
      created_at
    FROM notes
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ---------------- Delete Note ----------------
app.delete("/notes/:id", (req, res) => {
  const id = req.params.id;

  const sqlSelect = "SELECT upload_file FROM notes WHERE id = ?";
  db.query(sqlSelect, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Note not found" });

    const fullPath = path.join(__dirname, "uploads", results[0].upload_file);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    const sqlDelete = "DELETE FROM notes WHERE id = ?";
    db.query(sqlDelete, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Note deleted successfully" });
    });
  });
});

// ---------------- Contact Form ----------------
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  const sql =
    "INSERT INTO contact (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())";

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Database error" });
    }

    res.json({ success: true, message: "Message sent successfully!" });
  });
});

// ---------------- Admin: Contact Messages ----------------
app.get("/admin/contact-messages", (req, res) => {
  const sql = `
    SELECT id, name, email, subject, message, created_at
    FROM contact
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ---------------- Start Server ----------------
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
