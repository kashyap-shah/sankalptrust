import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Handle GET request to fetch a single user by ID
  if (req.method === "GET") {
    try {
      const userQuery = `
        SELECT id, username, phone_number, role
        FROM users
        WHERE id = $1 AND end_date IS NULL
      `;
      const userResult = await pool.query(userQuery, [id]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(userResult.rows[0]);
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
      if (decoded.role !== "admin") {
        return res.status(403).json({ error: "Access Denied. Admin only." });
      }

      const updateQuery = `
        UPDATE users
        SET username = $1, phone_number = $2
        ${password ? ", password = $3" : ""}
        WHERE id = $4 AND end_date IS NULL
      `;

      const params = [username, phone_number];
      if (password) params.push(password);
      params.push(id);

      const updateResult = await pool.query(updateQuery, params);

      if (updateResult.rowCount === 0) {
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
      if (decoded.role !== "admin") {
        return res.status(403).json({ error: "Access Denied. Admin only." });
      }

      const deleteQuery = `
        UPDATE users
        SET end_date = NOW()
        WHERE id = $1 AND end_date IS NULL
      `;
      const deleteResult = await pool.query(deleteQuery, [id]);

      if (deleteResult.rowCount === 0) {
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
