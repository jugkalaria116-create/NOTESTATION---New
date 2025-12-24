app.post("/register", (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // combine first + last name
  const fullName = `${firstName} ${lastName}`;

  const sql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [fullName, email, password], (err, result) => {
    if (err) {
      return res.status(500).send({ error: err.sqlMessage });
    }
    res.send({ message: "User registered successfully!" });
  });
});
