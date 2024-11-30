import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {
  // Handle GET request to fetch all users
  if (req.method === "GET") {
    try {
      const userQuery = `
        SELECT id, username, phone_number, role
        FROM users
        WHERE end_date IS NULL AND role = $1
      `;
      const userResult = await pool.query(userQuery, ["user"]);

      res.status(200).json(userResult.rows);
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handle POST request to create a new user
  else if (req.method === "POST") {
    const { username, phone_number, password, role = "user" } = req.body;

    // Validate the token for admin access
    const token = req.headers["auth-token"];
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, "secretkey");
      if (decoded.role !== "admin") {
        return res.status(403).json({ error: "Access Denied. Admin only." });
      }

      // Check if a user with the same phone number already exists
      const checkUserQuery = `
        SELECT id, username, phone_number, role
        FROM users
        WHERE phone_number = $1 AND role = $2 AND end_date IS NULL
      `;
      const checkUserResult = await pool.query(checkUserQuery, [phone_number, "user"]);

      if (checkUserResult.rows.length > 0) {
        return res.status(400).json({ error: "Phone number already exists." });
      }

      // Insert new user into the database
      const insertUserQuery = `
        INSERT INTO users (username, phone_number, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const insertUserResult = await pool.query(insertUserQuery, [
        username,
        phone_number,
        password,
        role,
      ]);

      res.status(201).json({
        message: "User created successfully",
        userId: insertUserResult.rows[0].id,
      });
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
