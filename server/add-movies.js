
const movies = [
  {
    title: "Avengers: Endgame",
    genre: "Action",
    duration: 181,
    showTime: "10:00 AM",
    seatsAvailable: 50,
    ticketPrice: 250,
  },
  {
    title: "Interstellar",
    genre: "Adventure",
    duration: 169,
    showTime: "6:00 PM",
    seatsAvailable: 20,
    ticketPrice: 220,
  },
];

async function addMissingMovies() {
  try {
    const existingResponse = await fetch(
      "http://localhost:5000/api/movies"
    );
    const existingMovies = await existingResponse.json();

    for (const movie of movies) {
      const alreadyExists = existingMovies.some(
        (existing) => existing.title === movie.title
      );

      if (alreadyExists) {
        console.log(`${movie.title} already exists. Skipping.`);
        continue;
      }

      const response = await fetch(
        "http://localhost:5000/api/movies",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movie),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`Added successfully: ${data.title}`);
      } else {
        console.log(`Failed to add ${movie.title}:`, data);
      }
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

addMissingMovies();
