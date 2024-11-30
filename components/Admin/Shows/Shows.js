import React, { useState, useEffect } from "react";
import styles from "./Shows.module.scss"; // Import SCSS for Shows
import axios from "axios";

const Shows = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [rows, setRows] = useState("");
  const [columns, setColumns] = useState("");
  const [shows, setShows] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Track if we are in editing mode
  const [editShowId, setEditShowId] = useState(null); // Store the ID of the show being edited

  useEffect(() => {
    // Fetch existing shows
    const fetchShows = async () => {
      try {
        
        const res = await axios.get("/api/shows", 
          {
          headers: { "auth-token": localStorage.getItem("token") },
          }
        );
        
        setShows(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchShows();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newShow = {
      title,
      time,
      venue,
      google_maps_link: googleMapsLink,
      total_seats: totalSeats,
      seat_rows: rows,
      seat_columns: columns,
    };

    try {
      if (isEditing) {
        // Send update request if editing
        await axios.put(
          `https://www.sankalptrust.org.in/api/shows/${editShowId}`,
          newShow,
          {
            headers: { "auth-token": localStorage.getItem("token") },
          }
        );
        setErrorMessage(""); // Clear error messages
      } else {
        // Send request to add the new show
        await axios.post("https://www.sankalptrust.org.in/api/shows", newShow, 
          {
          headers: { "auth-token": localStorage.getItem("token") },
          }
        );
        setErrorMessage(""); // Clear error messages
      }

      // Clear the form fields after submission
      setTitle("");
      setTime("");
      setVenue("");
      setGoogleMapsLink("");
      setTotalSeats("");
      setRows("");
      setColumns("");
      setIsEditing(false); // Reset to add mode
      setEditShowId(null); // Clear the editing show ID

      // Refetch shows after adding or updating the show
      const res = await axios.get("https://www.sankalptrust.org.in/api/shows", 
        {
        headers: { "auth-token": localStorage.getItem("token") },
        }
      );
      setShows(res.data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to add or update show");
    }
  };

  const handleEdit = (show) => {
    // Populate form with show data and switch to editing mode
    setTitle(show.title);

    // Convert the time to the expected format for datetime-local input
    const date = new Date(show.time);
    const formattedTime = date.toISOString().slice(0, 16); // Format to 'YYYY-MM-DDTHH:mm'
    setTime(formattedTime);

    setVenue(show.venue);
    setGoogleMapsLink(show.google_maps_link);
    setTotalSeats(show.total_seats);
    setRows(show.seat_rows);
    setColumns(show.seat_columns);
    setIsEditing(true);
    setEditShowId(show.id); // Store the show ID to be updated
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://www.sankalptrust.org.in/api/shows/${id}`, 
        {
        headers: { "auth-token": localStorage.getItem("token") },
        }
      );
      setShows(shows.filter((show) => show.id !== id));
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to delete show");
    }
  };

  return (
    <div className={styles["shows-container"]}>
      <h1>Shows List</h1>
      {shows?.length > 0 ? (
        <ul>
          {shows.map((show) => (
            <li key={show.id}>
              <div className={styles["show-details"]}>
                <span>
                  <b>Name: </b>
                  {show.title}
                </span>
                <span>
                  <b>Time : </b>
                  {new Date(show.time).toLocaleString()}
                </span>
                <span>
                  <b>Venue : </b>
                  {show.venue}
                </span>
              </div>
              <div className={styles["show-actions"]}>
                <button onClick={() => handleEdit(show)}>Edit</button>
                <button onClick={() => handleDelete(show.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <span>No data available</span>
      )}

      <hr />

      <h1>{isEditing ? "Edit Show" : "Add Show"}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Show Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          onKeyDown={(e) => e.preventDefault()}
          required
        />
        <input
          type="text"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Google Maps Link"
          value={googleMapsLink}
          onChange={(e) => setGoogleMapsLink(e.target.value)}
        />
        <input
          type="number"
          placeholder="Total Seats"
          value={totalSeats}
          onChange={(e) => setTotalSeats(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Rows"
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Columns"
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          required
        />
        <button type="submit">{isEditing ? "Update Show" : "Add Show"}</button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default Shows;
