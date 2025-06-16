const express = require("express");
const cors = require("cors");
const animeRoutes = require("./src/routes/anime-route");
const mangaRoutes = require("./src/routes/manga-route");

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Welcome to the Anime & Manga API",
  });
});

app.use("/anime", animeRoutes);
app.use("/manga", mangaRoutes);

app.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
