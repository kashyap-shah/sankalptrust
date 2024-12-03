import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {

  // Handle GET request to fetch bookings
  if (req.method === "GET") {
    try {
      const { showId, userId } = req.query; // Optional query parameters

      let query = "SELECT * FROM bookings WHERE deleted_at IS NULL";
      const params = [];

      // Filter bookings by showId or userId if provided
      if (showId) {
        query += " AND show_id = $1";
        params.push(showId);
      }

      if (userId) {
        query += " AND user_id = $" + (showId ? "$2" : "$1");
        params.push(userId);
      }

      const [bookings] = await pool.query(query, params);

      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Server error: " + error.message });
    }
  }

  // Handle POST request to create a new booking
  else if (req.method === "POST") {
    const { showId, seats } = req.body;

    // Validate the token for user access (assuming user must be logged in)
    const token = req.headers["auth-token"];
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
      const decoded = jwt.verify(token, "secretkey");
      const userId = decoded.id; // Assuming `id` is part of the decoded token payload
  
      if (!seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ error: "Invalid seats data." });
      }

      // Check existing bookings for the user in the specified show
      const result = await pool.query(
        "SELECT COUNT(*) AS ticket_count FROM bookings WHERE user_id = $1 AND show_id = $2",
        [userId, showId]
      );

      const existingTickets = result.rows && result.rows[0] ? result.rows[0].ticket_count : 0;
      const newTickets = seats.length;

      if (existingTickets + newTickets > 2) {
        res.status(201).json({
          message: "Booking limit exceeded. You can only book up to 2 tickets per show.",
          status: false,
        });
      }
  
       // Prepare the values and placeholders for bulk insert
      const valuePlaceholders = seats
        .map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`)
        .join(", ");
      
      const values = [];
      seats.forEach(({ row, column }) => {
        values.push(userId, showId, row, column);
      });
  
      const queryText = `
        INSERT INTO bookings (user_id, show_id, seat_row, seat_column)
        VALUES ${valuePlaceholders}
        RETURNING id
      `;
  
      // Execute the query
      const { rows } = await pool.query(queryText, values);
  
      res.status(201).json({
        message: "Bookings created successfully",
        bookingIds: rows.map(row => row.id),
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
