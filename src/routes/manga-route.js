const express = require("express");
const { 
  getManga, 
  getMangaDetails, 
  getChapterImages, 
  getMangaGenre, 
  getAllManga, 
  searchManga 
} = require("../controller/manga");

const router = express.Router();

router.get("/:page", getManga);
router.get("/details/:id", getMangaDetails);
router.get("/chapter/:id", getChapterImages);
router.get("/genre/:genre/page/:page", getMangaGenre);
router.get("/all/:page", getAllManga);
router.get("/search/:page", searchManga);

module.exports = router;
