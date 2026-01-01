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

// GET ALL USERS
app.get("/users", (req, res) => {
  const sql = "SELECT id, fname, lname, email FROM `user`";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ USERS ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// DELETE USER
app.delete("/users/:id", (req, res) => {
  const sql = "DELETE FROM `user` WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("❌ DELETE USER ERROR:", err);
      return res.status(500).json(err);
    }
    res.json({ success: result.affectedRows > 0 });
  });
});

// ================= REGISTER =================
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;

  const checkSql = "SELECT id FROM user WHERE email = ?";

  db.query(checkSql, [email], (err, results) => {
    if (err) {
      console.error("❌ REGISTER CHECK ERROR:", err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const insertSql = `
      INSERT INTO user (fname, lname, email, password)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [fname, lname, email, password], (err) => {
      if (err) {
        console.error("❌ REGISTER INSERT ERROR:", err);
        return res.status(500).json({ error: "Server error" });
      }

      res.json({ message: "Registration successful" });
    });
  });
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `
    SELECT id, fname, lname, email
    FROM user
    WHERE email = ? AND password = ?
  `;

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("❌ LOGIN ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    res.json({
      userId: user.id,
      name: `${user.fname} ${user.lname}`,
      email: user.email,
    });
  });
});

// ================= CONTACT =================
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  const sql = `
    INSERT INTO contact
    (Name, Email, Subject, contact_messages, Created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) {
      console.error("❌ INSERT CONTACT ERROR:", err);
      return res.status(500).json(err);
    }
    res.json({ success: true });
  });
});

// GET CONTACT MESSAGES (ADMIN)
app.get("/admin/contact-messages", (req, res) => {
  const sql = `
    SELECT
      id,
      Name AS name,
      Email AS email,
      Subject AS subject,
      contact_messages AS message,
      Created_at AS created_at
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

// DELETE CONTACT MESSAGE (ADMIN)
app.delete("/admin/contact-messages/:id", (req, res) => {
  const sql = "DELETE FROM contact WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("❌ DELETE CONTACT ERROR:", err);
      return res.status(500).json(err);
    }
    res.json({ success: result.affectedRows > 0 });
  });
});

// ================= NOTES (PDF UPLOAD) =================
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

app.post("/notes", upload.single("upload_file"), (req, res) => {
  const { title, description, subject, email } = req.body;
  const fileName = req.file?.filename;

  const sql = `
    INSERT INTO notes
    (title, description, subject, email, upload_file, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [title, description, subject, email, fileName], (err) => {
    if (err) {
      console.error("❌ NOTES INSERT ERROR:", err);
      return res.status(500).json(err);
    }
    res.json({ success: true });
  });
});

app.get("/notes", (req, res) => {
  db.query("SELECT * FROM notes ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("❌ NOTES FETCH ERROR:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
