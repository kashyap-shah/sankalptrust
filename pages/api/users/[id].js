import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {
  // Database configuration
  const dbConfig = {
    host: "localhost",
    user: "root",
    password: "password123",
    database: "auditorium_db",
  };

  const { id } = req.query;

  // Handle GET request to fetch a single user by ID
  if (req.method === "GET") {
    try {
      const [user] = await pool.execute(
        "SELECT id, username, phone_number, role FROM users WHERE id = ? AND end_date IS NULL",
        [id]
      );

      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user[0]);
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handle PUT request to update a user by ID
  else if (req.method === "PUT") {
    const { username, phone_number, password } = req.body;

    // Validate the token for admin access
    const token = req.headers["auth-token"];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, "secretkey");
      console.log("decoded", decoded);
      
      if (decoded.role !== "admin")
        return res.status(403).json({ error: "Access Denied. Admin only." });

      const sql = `
        UPDATE users
        SET username = '${username}', phone_number = '${phone_number}' ${password ? ", password = '" + password + "'" : ""} 
        WHERE id = '${id}' AND end_date IS NULL
      `;

      const [result] = await pool.execute(sql);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token." });
      }
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handle DELETE request to delete a user by ID (soft delete)
  else if (req.method === "DELETE") {
    // Validate the token for admin access
    const token = req.headers["auth-token"];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, "secretkey");
      if (decoded.role !== "admin")
        return res.status(403).json({ error: "Access Denied. Admin only." });

      const sql = `
        UPDATE users
        SET end_date = NOW()
        WHERE id = ? AND end_date IS NULL
      `;

      const [result] = await pool.execute(sql, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
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
