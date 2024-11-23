import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BookingPage.scss"; // Import the SCSS file

const BookingPage = () => {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/shows", {
          headers: { "auth-token": localStorage.getItem("user-token") },
        });
        setShows(res.data);
      } catch (err) {
        console.error("Failed to fetch shows", err);
      }
    };
    fetchShows();
  }, []);

  const handleBookShow = async (showData) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/shows/${showData?.id}/seats`,
        {
          headers: { "auth-token": localStorage.getItem("user-token") },
        }
      );
      setSeats(res.data);
      setSelectedShow(showData);
    } catch (err) {
      console.error("Failed to fetch seats", err);
    }
  };

  const handleSeatSelect = (seat) => {
    if (seat.booked) return;

    setSelectedSeats((prevSelected) =>
      prevSelected.some((s) => s.row === seat.row && s.column === seat.column)
        ? prevSelected.filter(
            (s) => !(s.row === seat.row && s.column === seat.column)
          )
        : [...prevSelected, seat]
    );
  };

  const handleBooking = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/bookings",
        { showId: selectedShow?.id, seats: selectedSeats },
        { headers: { "auth-token": localStorage.getItem("user-token") } }
      );
      setBookingMessage("Booking confirmed!");
      setSelectedSeats([]);
      handleBookShow(selectedShow);
    } catch (err) {
      console.error("Failed to book seats", err);
      setBookingMessage("Booking failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    window.location.reload();
  };

  return (
    <div className="booking-page">
      <h1 className="title">Available Shows</h1>
      <ul className="show-list">
        {shows.map((show) => (
          <li key={show.id} className="show-item">
            {show.title} - {new Date(show.time).toLocaleString()}
            <button
              onClick={() => handleBookShow(show)}
              className="book-button"
            >
              Book Show
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>

      {selectedShow && (
        <div className="seat-selection">
          <h2 className="subtitle">Seat Selection for {selectedShow?.title}</h2>
          <div className="screen">SCREEN</div>
          <div
            className="seat-grid"
            style={{
              gridTemplateColumns: `repeat(${Math.max(
                ...seats.map((seat) => seat.column)
              )}, 1fr)`, // Correct column count
              gap: "10px", // Add spacing between seats
              // padding: "20px", // Optional padding for better appearance
            }}
          >
            {seats.map((seat) => (
              <button
                key={`${seat.row}-${seat.column}`}
                onClick={() => handleSeatSelect(seat)}
                className={`seat ${
                  seat.booked
                    ? "booked"
                    : selectedSeats.some(
                        (s) => s.row === seat.row && s.column === seat.column
                      )
                    ? "selected"
                    : ""
                }`}
                disabled={seat.booked}
              >
                {seat.booked ? "🚫" : "🪑"}
              </button>
            ))}
          </div>

          <button onClick={handleBooking} className="confirm-button">
            Confirm Booking
          </button>
          {bookingMessage && (
            <p className="booking-message">{bookingMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingPage;
