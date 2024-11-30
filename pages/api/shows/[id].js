import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {
  const { id } = req.query;

  // Handling GET request to fetch a single show by ID
  if (req.method === "GET") {
    try {
      const showQuery = `
        SELECT * FROM shows 
        WHERE id = $1 AND deleted_at IS NULL
      `;
      const showResult = await pool.query(showQuery, [id]);

      if (showResult.rows.length === 0) {
        return res.status(404).json({ error: "Show not found" });
      }

      res.status(200).json(showResult.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handling PUT request to update a show by ID
  else if (req.method === "PUT") {
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
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, "secretkey");
      if (decoded.role !== "admin") {
        return res.status(403).json({ error: "Access Denied. Admin only." });
      }

      const updateQuery = `
        UPDATE shows
        SET title = $1, time = $2, venue = $3, google_maps_link = $4, 
            total_seats = $5, seat_rows = $6, seat_columns = $7
        WHERE id = $8 AND deleted_at IS NULL
      `;

      const result = await pool.query(updateQuery, [
        title,
        time,
        venue,
        google_maps_link,
        total_seats,
        seat_rows,
        seat_columns,
        id,
      ]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Show not found" });
      }

      res.status(200).json({ message: "Show updated successfully" });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token." });
      }

      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handling DELETE request to delete a show by ID (soft delete)
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
        UPDATE shows
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
      `;

      const result = await pool.query(deleteQuery, [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Show not found" });
      }

      res.status(200).json({ message: "Show deleted successfully" });
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
