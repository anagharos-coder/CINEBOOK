
async function testMovieAPI() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/movies",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Inception",
          genre: "Sci-Fi",
          duration: 148,
          showTime: "1:30 PM",
          seatsAvailable: 35,
          ticketPrice: 200,
        }),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.log("Request failed:", error.message);
  }
}

testMovieAPI();
