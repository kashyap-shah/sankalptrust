import pool from "util/db";

export default async function handler(req, res) {
  const { id: showId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch seat configuration for the given show
    const showQuery = 'SELECT seat_rows, seat_columns FROM shows WHERE id = $1';
    const showResult = await pool.query(showQuery, [showId]);

    if (showResult.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const { seat_rows, seat_columns } = showResult.rows[0];

    // Fetch booked seats for the given show
    const bookedQuery = 'SELECT seat_row, seat_column FROM bookings WHERE show_id = $1';
    const bookedResult = await pool.query(bookedQuery, [showId]);

    // Create a set of booked seats for quick lookup
    const bookedSeats = new Set(
      bookedResult.rows.map((seat) => `${seat.seat_row}-${seat.seat_column}`)
    );

    // Generate all seats with their booking status
    const seats = [];
    for (let row = 1; row <= seat_rows; row++) {
      for (let column = 1; column <= seat_columns; column++) {
        seats.push({
          row,
          column,
          booked: bookedSeats.has(`${row}-${column}`),
        });
      }
    }

    return res.status(200).json(seats);
  } catch (error) {
    console.error('Error fetching seat data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
