import AuthPage from "./AuthPage";
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://cinebook-1-494j.onrender.com/api/movies";

const ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 10;

const movieDetails = {
  "Avengers: Endgame": {
    rating: "8.4",
    poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },
  Inception: {
    rating: "8.8",
    poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  Interstellar: {
    rating: "8.7",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },
  "The Dark Knight": {
    rating: "9.0",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  Avatar: {
    rating: "7.9",
    poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg",
  },
};

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [selectedSeats, setSelectedSeats] = useState({});
  const [activeMovie, setActiveMovie] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Login and registration state
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cinebookUser")) || null;
    } catch {
      return null;
    }
  });

  async function fetchMovies() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load movies.");
      }

      const data = await response.json();
      setMovies(data);
    } catch {
      setError(
        "Unable to load movies. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  const genres = [
    "All",
    ...new Set(movies.map((movie) => movie.genre)),
  ];

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()) &&
      (genre === "All" || movie.genre === genre)
  );

  function toggleSeat(movie, seat) {
    if (bookingLoading) return;

    const bookedSeats = movie.bookedSeats || [];

    if (bookedSeats.includes(seat)) return;

    setSelectedSeats((current) => {
      const existing = current[movie._id] || [];
      const isSelected = existing.includes(seat);

      if (isSelected) {
        return {
          ...current,
          [movie._id]: existing.filter((item) => item !== seat),
        };
      }

      if (existing.length >= 10) {
        setBooking({
          error: "You can select a maximum of 10 seats per booking.",
        });
        return current;
      }

      if (existing.length >= movie.seatsAvailable) {
        setBooking({
          error: "You cannot select more seats than are available.",
        });
        return current;
      }

      setBooking(null);

      return {
        ...current,
        [movie._id]: [...existing, seat],
      };
    });
  }

  async function bookTicket(movie) {
    if (bookingLoading) return;

    const seatNumbers = selectedSeats[movie._id] || [];

    if (seatNumbers.length === 0) {
      setBooking({ error: "Please select at least one seat." });
      return;
    }

    try {
      setBookingLoading(true);
      setBooking(null);

      const response = await fetch(`${API_URL}/${movie._id}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seatNumbers }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBooking({
          error: data.message || "Unable to book your seats.",
        });

        await fetchMovies();
        return;
      }

      const bookedMovie = data.movie;

      setMovies((current) =>
        current.map((item) =>
          item._id === movie._id ? bookedMovie : item
        )
      );

      setBooking({
        movie: bookedMovie,
        seatNumbers: data.seatNumbers,
        quantity: data.quantity,
        totalPrice: data.totalPrice,
      });

      setSelectedSeats((current) => ({
        ...current,
        [movie._id]: [],
      }));

      setActiveMovie(null);
    } catch {
      setBooking({
        error: "Booking failed. Please check your connection.",
      });
    } finally {
      setBookingLoading(false);
    }
  }

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("cinebookToken");
    localStorage.removeItem("cinebookUser");
    setCurrentUser(null);
  }

  const ticketStyles = {
    card: {
      background: "linear-gradient(145deg, #191c29, #10121b)",
      border: "1px solid #343849",
      borderRadius: "20px",
      overflow: "hidden",
      margin: "28px 0",
      color: "#ffffff",
      boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
    },
    success: {
      padding: "24px",
      textAlign: "center",
      background: "linear-gradient(135deg, #123b2d, #10251f)",
      borderBottom: "1px dashed #4b7864",
    },
    details: {
      display: "flex",
      gap: "20px",
      alignItems: "center",
      padding: "24px",
      flexWrap: "wrap",
    },
    poster: {
      width: "110px",
      height: "155px",
      objectFit: "cover",
      borderRadius: "10px",
    },
    button: {
      background: "#e83d50",
      color: "white",
      border: "none",
      borderRadius: "10px",
      padding: "12px 20px",
      fontWeight: "bold",
      cursor: "pointer",
      marginTop: "16px",
    },
  };

  const seatButtonStyle = {
    width: "36px",
    height: "34px",
    borderRadius: "7px 7px 4px 4px",
    fontSize: "11px",
    fontWeight: "bold",
    border: "1px solid rgba(255,255,255,0.18)",
    cursor: "pointer",
    padding: "0",
  };

  // Show Login/Register page
  if (showAuth) {
    return (
      <AuthPage
        onBack={() => setShowAuth(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setShowAuth(false);
        }}
      />
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="/">
          CINE<span>BOOK</span>
        </a>

        <span className="nav-label">Your movie night starts here</span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {currentUser ? (
            <>
              <span style={{ color: "#ffffff", fontSize: "14px" }}>
                Hi, {currentUser.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  color: "#ffffff",
                  border: "1px solid #e83d50",
                  borderRadius: "8px",
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              style={{
                background: "#e83d50",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Login / Register
            </button>
          )}
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <p className="eyebrow">WELCOME TO CINEBOOK</p>
          <h1>
            <span className="light-text">Lights.</span>{" "}
            <span className="camera-text">Camera.</span>{" "}
            <span className="action-text">Action.</span>
          </h1>
          <p>Discover your next favourite movie and book your seat.</p>
        </section>

        <section className="catalog">
          <div className="section-heading">
            <div>
              <h2>Now Showing</h2>
              <p>Find a movie for your next big-screen experience.</p>
            </div>
            <span className="movie-count">
              {filteredMovies.length} movies
            </span>
          </div>

          <div className="filters">
            <input
              type="search"
              placeholder="Search movies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
            >
              {genres.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All genres" : item}
                </option>
              ))}
            </select>
          </div>

          {booking?.error && (
            <div
              role="alert"
              style={{
                padding: "16px",
                margin: "24px 0",
                borderRadius: "12px",
                background: "#451d25",
                color: "#fecaca",
                border: "1px solid #ef4444",
              }}
            >
              {booking.error}
            </div>
          )}

          {booking?.movie && (
            <section style={ticketStyles.card} aria-live="polite">
              <div style={ticketStyles.success}>
                <div style={{ fontSize: "42px", marginBottom: "8px" }}>
                  ✓
                </div>
                <h2 style={{ color: "#86efac", margin: "0 0 8px" }}>
                  Booking Confirmed!
                </h2>
                <p style={{ color: "#d1fae5", margin: 0 }}>
                  Your selected seats have been reserved successfully.
                </p>
              </div>

              <div style={ticketStyles.details}>
                {movieDetails[booking.movie.title]?.poster && (
                  <img
                    src={movieDetails[booking.movie.title].poster}
                    alt={`${booking.movie.title} poster`}
                    style={ticketStyles.poster}
                  />
                )}

                <div style={{ flex: "1", minWidth: "180px" }}>
                  <p
                    style={{
                      color: "#fca5a5",
                      margin: "0 0 8px",
                      fontWeight: "bold",
                    }}
                  >
                    YOUR CINEBOOK TICKET
                  </p>

                  <h2 style={{ margin: "0 0 12px" }}>
                    {booking.movie.title}
                  </h2>

                  <p style={{ color: "#cbd5e1", margin: "6px 0" }}>
                    {booking.movie.genre} · {booking.movie.duration} min
                  </p>

                  <p style={{ color: "#cbd5e1", margin: "6px 0" }}>
                    <strong>Showtime:</strong> {booking.movie.showTime}
                  </p>

                  <p style={{ color: "#cbd5e1", margin: "6px 0" }}>
                    <strong>Selected seats:</strong>{" "}
                    {booking.seatNumbers.join(", ")}
                  </p>

                  <p style={{ color: "#cbd5e1", margin: "6px 0" }}>
                    <strong>Tickets:</strong> {booking.quantity}
                  </p>

                  <p style={{ color: "#cbd5e1", margin: "6px 0" }}>
                    <strong>Price per ticket:</strong> ₹
                    {booking.movie.ticketPrice}
                  </p>

                  <p
                    style={{
                      color: "#86efac",
                      margin: "10px 0",
                      fontSize: "20px",
                      fontWeight: "bold",
                    }}
                  >
                    Total: ₹{booking.totalPrice}
                  </p>
                </div>
              </div>

              <div style={{ padding: "0 24px 24px", textAlign: "center" }}>
                <p style={{ color: "#9ca3af", margin: "0 0 8px" }}>
                  Enjoy your movie experience with CINEBOOK 🍿
                </p>
                <button
                  style={ticketStyles.button}
                  onClick={() => setBooking(null)}
                >
                  Back to Movies
                </button>
              </div>
            </section>
          )}

          {loading && <p>Loading movies...</p>}

          {error && (
            <p className="message" role="alert">
              {error} <button onClick={fetchMovies}>Try Again</button>
            </p>
          )}

          {!loading && !error && (
            <>
              <div className="movie-grid">
                {filteredMovies.map((movie) => {
                  const details = movieDetails[movie.title] || {
                    rating: "N/A",
                    poster: "",
                  };

                  const bookedSeats = movie.bookedSeats || [];
                  const chosenSeats = selectedSeats[movie._id] || [];
                  const isOpen = activeMovie === movie._id;

                  return (
                    <article className="movie-card" key={movie._id}>
                      <div className="poster-wrap">
                        {details.poster && (
                          <img
                            className="poster"
                            src={details.poster}
                            alt={`${movie.title} poster`}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <span className="rating">★ {details.rating}</span>
                      </div>

                      <div className="movie-info">
                        <span className="genre">{movie.genre}</span>
                        <h3>{movie.title}</h3>

                        <p>
                          {movie.duration} min · {movie.showTime}
                        </p>

                        <p className="seats">
                          {movie.seatsAvailable > 0
                            ? `${movie.seatsAvailable} seats available`
                            : "Sold out"}
                        </p>

                        <p>₹{movie.ticketPrice} per ticket</p>

                        <button
                          className="book-button"
                          disabled={
                            movie.seatsAvailable === 0 || bookingLoading
                          }
                          onClick={() => {
                            setBooking(null);
                            setActiveMovie(isOpen ? null : movie._id);
                          }}
                        >
                          {movie.seatsAvailable === 0
                            ? "Sold Out"
                            : isOpen
                              ? "Close Seat Selection"
                              : "Choose Your Seats"}
                        </button>

                        {isOpen && (
                          <div
                            style={{
                              marginTop: "20px",
                              padding: "12px",
                              background: "#10121b",
                              border: "1px solid #343849",
                              borderRadius: "12px",
                              color: "white",
                            }}
                          >
                            <h4 style={{ textAlign: "center" }}>
                              Select Your Seats
                            </h4>

                            <div
                              style={{
                                textAlign: "center",
                                padding: "8px",
                                marginBottom: "16px",
                                background: "#343849",
                                borderRadius: "8px",
                                letterSpacing: "4px",
                                fontSize: "12px",
                              }}
                            >
                              SCREEN
                            </div>

                            {ROWS.map((row) => (
                              <div
                                key={row}
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "5px",
                                  marginBottom: "7px",
                                }}
                              >
                                {Array.from(
                                  { length: SEATS_PER_ROW },
                                  (_, index) => `${row}${index + 1}`
                                ).map((seat) => {
                                  const isBooked = bookedSeats.includes(seat);
                                  const isSelected = chosenSeats.includes(seat);

                                  let background = "#16a34a";
                                  if (isBooked) background = "#dc2626";
                                  if (isSelected) background = "#eab308";

                                  return (
                                    <button
                                      key={seat}
                                      type="button"
                                      title={
                                        isBooked
                                          ? `${seat} is booked`
                                          : `${seat} ${isSelected ? "selected" : "available"}`
                                      }
                                      aria-label={seat}
                                      aria-pressed={isSelected}
                                      disabled={isBooked || bookingLoading}
                                      onClick={() => toggleSeat(movie, seat)}
                                      style={{
                                        ...seatButtonStyle,
                                        background,
                                        color: isSelected ? "#111827" : "white",
                                        opacity: isBooked ? 0.8 : 1,
                                        cursor: isBooked
                                          ? "not-allowed"
                                          : "pointer",
                                      }}
                                    >
                                      {seat}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}

                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: "12px",
                                fontSize: "12px",
                                margin: "18px 0",
                              }}
                            >
                              <span>🟢 Available</span>
                              <span>🔴 Booked</span>
                              <span>🟡 Selected</span>
                            </div>

                            <p style={{ textAlign: "center" }}>
                              Selected:{" "}
                              {chosenSeats.length
                                ? chosenSeats.join(", ")
                                : "None"}
                            </p>

                            <p
                              style={{
                                textAlign: "center",
                                color: "#ff6b78",
                                fontWeight: "bold",
                                fontSize: "17px",
                              }}
                            >
                              Total: ₹
                              {movie.ticketPrice * chosenSeats.length}
                            </p>

                            <button
                              className="book-button"
                              disabled={
                                chosenSeats.length === 0 || bookingLoading
                              }
                              onClick={() => bookTicket(movie)}
                              style={{
                                width: "100%",
                                opacity:
                                  chosenSeats.length === 0 || bookingLoading
                                    ? 0.6
                                    : 1,
                              }}
                            >
                              {bookingLoading
                                ? "Booking..."
                                : `Confirm ${chosenSeats.length} ${
                                    chosenSeats.length === 1 ? "Seat" : "Seats"
                                  }`}
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredMovies.length === 0 && (
                <p className="empty">
                  No movies found. Try another search.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <footer>
        © 2026 CineBook · Your cinema experience starts here.
      </footer>
    </div>
  );
}

export default App;