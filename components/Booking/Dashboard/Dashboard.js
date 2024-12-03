import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Dashboard.module.scss";

const Dashboard = () => {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await axios.get("https://www.sankalptrust.org.in/api/shows", {
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
        `https://www.sankalptrust.org.in/api/shows/${showData?.id}/seats`,
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
        "https://www.sankalptrust.org.in/api/bookings",
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

  const maxColumns = Math.max(...seats.map((seat) => seat.column));
  const midPoint = Math.ceil(maxColumns / 2);

  return (
    <div className={styles["booking-page"]}>
      <h1 className={styles["title"]}>Available Shows</h1>
      <ul className={styles["show-list"]}>
        {shows.map((show) => (
          <li key={show.id} className="show-item">
            {show.title} - {new Date(show.time).toLocaleString()}
            <button
              onClick={() => handleBookShow(show)}
              className={styles["book-button"]}
            >
              Book Show
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleLogout} className={styles["logout-button"]}>
        Logout
      </button>

      {selectedShow && (
        <div className={styles["seat-selection"]}>
          <h2 className={styles["subtitle"]}>
            Seat Selection for {selectedShow?.title}
          </h2>
          <div className={styles["screen"]}>SCREEN</div>
          <div className={styles["seat-container"]}>
            <div className={styles["left-seats"]}>
              {seats
                .filter((seat) => seat.column <= midPoint)
                .map((seat) => (
                  <button
                    key={`${seat.row}-${seat.column}`}
                    onClick={() => handleSeatSelect(seat)}
                    className={`${styles.seat} ${
                      seat.booked
                        ? styles.booked
                        : selectedSeats.some(
                            (s) => s.row === seat.row && s.column === seat.column
                          )
                        ? styles.selected
                        : ""
                    }`}
                    disabled={seat.booked}
                    title={`Row: ${seat.row}, Column: ${seat.column}`}
                  >
                    {seat.booked ? "🚫" : "🪑"}
                  </button>
                ))}
            </div>
            <div className={styles["walkway"]}>Walkway</div>
            <div className={styles["right-seats"]}>
              {seats
                .filter((seat) => seat.column > midPoint)
                .map((seat) => (
                  <button
                    key={`${seat.row}-${seat.column}`}
                    onClick={() => handleSeatSelect(seat)}
                    className={`${styles.seat} ${
                      seat.booked
                        ? styles.booked
                        : selectedSeats.some(
                            (s) => s.row === seat.row && s.column === seat.column
                          )
                        ? styles.selected
                        : ""
                    }`}
                    disabled={seat.booked}
                    title={`Row: ${seat.row}, Column: ${seat.column}`}
                  >
                    {seat.booked ? "🚫" : "🪑"}
                  </button>
                ))}
            </div>
          </div>
          <button onClick={handleBooking} className={styles["confirm-button"]}>
            Confirm Booking
          </button>
          {bookingMessage && (
            <p className={styles["booking-message"]}>{bookingMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
