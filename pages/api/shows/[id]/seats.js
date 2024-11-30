import pool from "util/db";

export default async function handler(req, res) {
  const { id: showId } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch seat configuration for the given show
    const [showResults] = await pool.query(
      'SELECT seat_rows, seat_columns FROM shows WHERE id = ?',
      [showId]
    );

    if (showResults.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    const { seat_rows, seat_columns } = showResults[0];

    // Fetch booked seats for the given show
    const [bookedResults] = await pool.query(
      'SELECT seat_row, seat_column FROM bookings WHERE show_id = ?',
      [showId]
    );

    // Create a set of booked seats for quick lookup
    const bookedSeats = new Set(
      bookedResults.map((seat) => `${seat.seat_row}-${seat.seat_column}`)
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
