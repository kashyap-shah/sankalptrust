import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Fetch all shows
    try {
      const showQuery = "SELECT * FROM shows WHERE deleted_at IS NULL";
      const showResult = await pool.query(showQuery);

      res.status(200).json(showResult.rows);
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  } else if (req.method === "POST") {
    // Add a new show
    const {
      title,
      time,
      venue,
      google_maps_link,
      total_seats,
      seat_rows,
      seat_columns,
    } = req.body;

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

      const insertQuery = `
        INSERT INTO shows (title, time, venue, google_maps_link, total_seats, seat_rows, seat_columns)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await pool.query(insertQuery, [
        title,
        time,
        venue,
        google_maps_link,
        total_seats,
        seat_rows,
        seat_columns,
      ]);

      res.status(200).json({ message: "Show added successfully" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token." });
      }

      res.status(500).json({ error: "Server error: " + error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
