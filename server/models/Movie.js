
const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  genre: { type: String, required: true, trim: true },
  duration: { type: Number, required: true, min: 1 },
  showTime: { type: String, required: true },
  seatsAvailable: { type: Number, required: true, min: 0, default: 50 },
  ticketPrice: { type: Number, required: true, min: 0 },

  // Store the seat numbers already booked
  bookedSeats: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Movie", movieSchema);
