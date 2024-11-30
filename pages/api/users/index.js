import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {

  // Handle GET request to fetch all users
  if (req.method === "GET") {
    try {

      const [users] = await pool.execute("SELECT id, username, phone_number, role FROM users WHERE end_date IS NULL AND role = 'user'");

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handle POST request to create a new user
  else if (req.method === "POST") {
    const { username, phone_number, password, role = "user" } = req.body;

    // Validate the token for admin access
    const token = req.headers["auth-token"];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, "secretkey");
      if (decoded.role !== "admin")
        return res.status(403).json({ error: "Access Denied. Admin only." });

      const [user] = await pool.execute(
        `SELECT id, username, phone_number, role FROM users WHERE phone_number = ${phone_number} AND role = 'user' AND end_date IS NULL`);

      if (user.length > 0) {
        return res.status(404).json({ error: "Phone number exists." });
      }

      // Insert new user into the database
      const [result] = await pool.execute(
        "INSERT INTO users (username, phone_number, password, role) VALUES (?, ?, ?, ?)",
        [username, phone_number, password, role]
      );

      res.status(201).json({ message: "User created successfully", userId: result.insertId });
    } catch (error) {
      if (error.username === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token." });
      }
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handle unsupported HTTP methods
  else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
