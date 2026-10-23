const authRoutes = require("./authRoutes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Movie = require("./models/Movie");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("CINEBOOK API is running!");
});

// Get all movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch movies" });
  }
});

// Get one movie
app.get("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    res.status(400).json({ message: "Invalid movie ID" });
  }
});

// Add a movie
app.post("/api/movies", async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({
      message: "Failed to add movie",
      error: error.message,
    });
  }
});

// Update a movie
app.put("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update movie",
      error: error.message,
    });
  }
});

// Delete a movie
app.delete("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete movie" });
  }
});

// Book specific seats
app.post("/api/movies/:id/book", async (req, res) => {
  try {
    const { seatNumbers } = req.body;

    // Validate the selected seats
    if (
      !Array.isArray(seatNumbers) ||
      seatNumbers.length === 0 ||
      seatNumbers.some(
        (seat) =>
          typeof seat !== "string" ||
          !/^[A-E](10|[1-9])$/.test(seat)
      ) ||
      new Set(seatNumbers).size !== seatNumbers.length
    ) {
      return res.status(400).json({
        message: "Select valid, unique seats from A1 to E10",
      });
    }

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const bookedSeats = movie.bookedSeats || [];

    // Check whether any selected seat is already booked
    const alreadyBooked = seatNumbers.filter((seat) =>
      bookedSeats.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        message: `These seats are already booked: ${alreadyBooked.join(", ")}`,
        bookedSeats,
      });
    }

    if (seatNumbers.length > movie.seatsAvailable) {
      return res.status(400).json({
        message: "Not enough seats available",
      });
    }

    // Atomically add seats only if none of them is already booked.
    // This prevents simultaneous requests from booking the same seat.
    const updatedMovie = await Movie.findOneAndUpdate(
      {
        _id: req.params.id,
        seatsAvailable: { $gte: seatNumbers.length },
        bookedSeats: { $nin: seatNumbers },
      },
      {
        $addToSet: { bookedSeats: { $each: seatNumbers } },
        $inc: { seatsAvailable: -seatNumbers.length },
      },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(409).json({
        message: "A selected seat was just booked. Refresh and select again.",
      });
    }

    res.json({
      message: "Seats booked successfully!",
      seatNumbers,
      quantity: seatNumbers.length,
      totalPrice: seatNumbers.length * updatedMovie.ticketPrice,
      movie: updatedMovie,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
