const cheerio = require("cheerio");
const fetchData = require("../utils/helper/fetch");
const baseUrl = require("../utils/constant/url");
const { getStreamingLinks } = require("../utils/helper/iframe");
const {
  getNonce,
  processDownloadLinks,
} = require("../utils/helper/get-episode");

const getOngoingAnime = async (req, res) => {
  const page = req.params.page || 1;
  const url = `${baseUrl.anime}/ongoing-anime/page/${page}`;
  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);
    let ongoingAnime = [];

    $(".venz > ul > li").each((index, element) => {
      const title = $(element).find("h2").text();
      const image = $(element).find("img").attr("src");
      const episode = $(element).find(".epz").text().trim();
      const updated_day = $(element).find(".epztipe").text().trim();
      const updated_on = $(element).find(".newnime").text();
      const anime_id = $(element).find(".thumb > a").attr("href").split("/")[4];

      ongoingAnime.push({
        title,
        image,
        episode,
        updated_day,
        updated_on,
        anime_id,
      });
    });

    const currentPage = parseInt($(".pagination .page-numbers.current").text());

    // Menentukan halaman berikutnya
    const nextPageLink = $(".pagination .next.page-numbers").attr("href");
    const hasNextPage = nextPageLink != null;

    const prevPageLink = $(".pagination .prev.page-numbers").attr("href");
    const hasPrevPage = prevPageLink != null;

    res.send({
      status: true,
      message: "success get ongoing anime",
      data: ongoingAnime,
      pagination: {
        current_page: currentPage,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getFinishedAnime = async (req, res) => {
  const page = req.params.page || 1;
  const url = `${baseUrl.anime}/complete-anime/page/${page}`;
  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);
    let finishedAnime = [];

    $(".venz > ul > li").each((index, element) => {
      const title = $(element).find("h2").text();
      const image = $(element).find("img").attr("src");
      const episode = $(element).find(".epz").text();
      const rating = $(element).find(".epztipe").text().trim();
      const updated_on = $(element).find(".newnime").text();
      const anime_id = $(element).find(".thumb > a").attr("href").split("/")[4];

      finishedAnime.push({
        title,
        image,
        episode,
        rating,
        updated_on,
        anime_id,
      });
    });

    const currentPage = parseInt($(".pagination .page-numbers.current").text());

    // Menentukan halaman berikutnya
    const nextPageLink = $(".pagination .next.page-numbers").attr("href");
    const hasNextPage = nextPageLink != null;

    const prevPageLink = $(".pagination .prev.page-numbers").attr("href");
    const hasPrevPage = prevPageLink != null;

    res.send({
      status: true,
      message: "success get ongoing anime",
      data: finishedAnime,
      pagination: {
        current_page: currentPage,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getListAnime = async (req, res) => {
  const url = `${baseUrl.anime}/anime-list/`;
  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);

    let animeList = [];

    $(".bariskelom").each((index, element) => {
      $(element)
        .find(".penzbar")
        .each((i, item) => {
          const titleElement = $(item).find(".jdlbar a");
          if (titleElement.length > 0) {
            const title = $(item).find(".jdlbar a").text().trim();
            const anime_id = $(item)
              .find(".jdlbar a")
              .attr("href")
              .split("/")[4];

            // Check status anime if available
            const status = $(item).find(".jdlbar span").text().trim();

            animeList.push({
              title,
              anime_id,
              status,
            });
          }
        });
    });

    res.send({
      status: true,
      message: "success get anime list",
      data: animeList,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const searchAnime = async (req, res) => {
  const query = req.query.query;
  const url = `${baseUrl.anime}/?s=${query}&post_type=anime`;
  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);

    let searchResults = [];

    $(".chivsrc li").each((index, element) => {
      const title = $(element).find("h2 > a").text().trim();
      const anime_id = $(element).find("h2 > a").attr("href").split("/")[4];
      const image = $(element).find("img").attr("src");

      const genres = [];
      $(element)
        .find(".set")
        .first()
        .find("a")
        .each((i, genre) => {
          genres.push($(genre).text().trim());
        });

      const status = $(element)
        .find(".set")
        .eq(1)
        .text()
        .replace(/^Status\s*[:\-]?\s*/, "")
        .trim();

      const rating = $(element)
        .find(".set")
        .eq(2)
        .text()
        .replace(/^Rating\s*[:\-]?\s*/, "")
        .trim();

      searchResults.push({
        title,
        anime_id,
        image,
        genres,
        status,
        rating,
      });
    });

    res.send({
      status: true,
      message: "success search anime",
      data: searchResults,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getAnimeDetails = async (req, res) => {
  const anime_id = req.params.anime_id;
  const url = `${baseUrl.anime}/anime/${anime_id}`;

  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);

    let animeDetails = {};
    let episodeList = [];
    const main_title = $("h1").text().trim();

    $(".fotoanime").each((index, element) => {
      const image = $(element).find("img").attr("src");

      const animeInfo = {
        title: "",
        japanese: "",
        score: "",
        producers: [],
        type: "",
        status: "",
        total_episode: "",
        duration: "",
        release_date: "",
        studios: [],
        genres: [],
        sinopsis: [],
      };

      $(".infozin .infozingle p span").each((i, spanElement) => {
        const text = $(spanElement).text().trim();

        if (text.includes("Judul:")) {
          animeInfo.title = text.replace("Judul:", "").trim();
        } else if (text.includes("Japanese:")) {
          animeInfo.japanese = text.replace("Japanese:", "").trim();
        } else if (text.includes("Skor:")) {
          animeInfo.score = text.replace("Skor:", "").trim();
        } else if (text.includes("Tipe:")) {
          animeInfo.type = text.replace("Tipe:", "").trim();
        } else if (text.includes("Status:")) {
          animeInfo.status = text.replace("Status:", "").trim();
        } else if (text.includes("Total Episode:")) {
          animeInfo.total_episode = text.replace("Total Episode:", "").trim();
        } else if (text.includes("Durasi:")) {
          animeInfo.duration = text.replace("Durasi:", "").trim();
        } else if (text.includes("Tanggal Rilis:")) {
          animeInfo.release_date = text.replace("Tanggal Rilis:", "").trim();
        } else if (text.includes("Genre:")) {
          const genres = text
            .replace("Genre:", "")
            .split(",")
            .map((genre) => genre.trim());
          animeInfo.genres.push(...genres);
        } else if (text.includes("Studio:")) {
          const studios = text
            .replace("Studio:", "")
            .split(",")
            .map((studio) => studio.trim());
          animeInfo.studios.push(...studios);
        } else if (text.includes("Produser:")) {
          const producers = text
            .replace("Produser:", "")
            .split(",")
            .map((producer) => producer.trim());
          animeInfo.producers.push(...producers);
        }
      });

      $(element)
        .find(".sinopc > p")
        .each((i, sinopsisElement) => {
          animeInfo.sinopsis.push($(sinopsisElement).text().trim());
        });

      animeDetails = {
        main_title,
        image,
        title: animeInfo.title,
        japanese: animeInfo.japanese,
        score: animeInfo.score,
        producers: animeInfo.producers,
        type: animeInfo.type,
        status: animeInfo.status,
        total_episode: animeInfo.total_episode,
        duration: animeInfo.duration,
        release_date: animeInfo.release_date,
        studios: animeInfo.studios,
        genres: animeInfo.genres,
        sinopsis: animeInfo.sinopsis,
      };
    });

    $(".episodelist ul li").each((index, element) => {
      const episode_title = $(element).find("a").text().trim();
      const episode_id = $(element).find("a").attr("href").split("/")[4];
      const episode_date = $(element).find(".zeebr").text().trim();

      episodeList.push({
        episode_title,
        episode_id,
        episode_date,
      });
    });

    res.json({
      status: true,
      data: animeDetails,
      episode_list: episodeList,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getAnimeEpisode = async (req, res) => {
  const anime_id = req.params.anime_id;
  const url = `${baseUrl.anime}/episode/${anime_id}`;

  try {
    const data = await fetchData(url, res);
    const nonce = await getNonce();
    const $ = cheerio.load(data);
    const obj = {};

    obj.title = $(".venutama > h1").text();
    obj.relative = [];

    $(".flir > a").each((index, element) => {
      const title_ref = $(element).text();
      const link_ref = $(element).attr("href").split("/")[4];
      obj.relative.push({ title_ref, link_ref });
    });

    obj.list_episode = [];

    $("#selectcog > option").each((index, element) => {
      const episode_title = $(element).text();
      const episode_id = $(element).attr("value").split("/")[4];

      if (episode_id) {
        obj.list_episode.push({ episode_title, episode_id });
      }
    });

    const streaming1 = await getStreamingLinks($, ".mirrorstream > .m360p > li", nonce, '360p');
    const streaming2 = await getStreamingLinks($, ".mirrorstream > .m480p > li", nonce, '480p');
    const streaming3 = await getStreamingLinks($, ".mirrorstream > .m720p > li", nonce, '720p');

    obj.mirror_embed1 = { quality: "360p", streaming: streaming1 };
    obj.mirror_embed2 = { quality: "480p", streaming: streaming2 };
    obj.mirror_embed3 = { quality: "720p", streaming: streaming3 };

    const downloadSection = $(".download");
    let downloadLinks = {};
    
    if (downloadSection.length) {
      if ($("ul > li:nth-child(1)").text() === "") {
        downloadSection.find(".yondarkness-box").each((_, box) => {
          const links = processDownloadLinks($, $(box));
          downloadLinks = {
            mp4: { ...downloadLinks.mp4, ...links.mp4 },
            mkv: { ...downloadLinks.mkv, ...links.mkv }
          };
        });
      } else {
        downloadSection.find("ul").each((_, ul) => {
          const links = processDownloadLinks($, $(ul));
          downloadLinks = {
            mp4: { ...downloadLinks.mp4, ...links.mp4 },
            mkv: { ...downloadLinks.mkv, ...links.mkv }
          };
        });
      }
    }

    obj.download_links = downloadLinks;

    res.send({
      status: true,
      message: "success get anime episode",
      data: obj,
    });
  } catch (err) {
    res.send({
      status: false,
      message: err.message,
    });
  }
};

const getBatchAnime = async (req, res) => {
  const batch_id = req.params.batch_id;
  const fullUrl = `${baseUrl.anime}/batch/${batch_id}`;
  console.log(fullUrl);
  try {
    const data = await fetchData(fullUrl, res);
    const $ = cheerio.load(data);
    const batch = {};
    batch.title = $(".batchlink > h4").text();
    batch.download_links = [];

    $(".batchlink li").each((index, element) => {
      const quality = $(element).find("strong").text();
      const links = [];

      $(element)
        .find("a")
        .each((i, el) => {
          const host = $(el).text().trim();
          const link = $(el).attr("href");
          links.push({ host, link });
        });

      if (quality) {
        batch.download_links.push({
          quality: quality,
          links: links,
        });
      }
    });

    res.send({
      status: true,
      message: "success get batch anime",
      data: batch,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getGenreList = async (req, res) => {
  const url = `${baseUrl.anime}/genre-list/`;
  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);

    let genreList = [];

    $(".genres")
      .find("a")
      .each((index, element) => {
        const genre = $(element).text().trim();
        const genre_id = $(element).attr("href").split("/")[2];

        genreList.push({
          genre,
          genre_id,
        });
      });

    res.send({
      status: true,
      message: "success get genre list",
      data: genreList,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getGenreDetails = async (req, res) => {
  const genre_id = req.params.genre_id;
  const page = req.params.page || 1;
  const url = `${baseUrl.anime}/genres/${genre_id}/page/${page}`;

  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);

    const animeList = [];
    
    $(".col-md-4.col-anime-con").each((index, element) => {
      const title = $(element).find('.col-anime-title > a').text();
      const anime_id = $(element).find('.col-anime-title > a').attr('href').split('/')[4];
      const studio = $(element).find('.col-anime-studio').text();
      const episode = $(element).find('.col-anime-eps').text();
      const rating = $(element).find('.col-anime-rating').text();

      const genres = [];
      $(element).find('.col-anime-genre > a').each((i, genre) => {
        genres.push($(genre).text());
      });

      const image = $(element).find('.col-anime-cover > img').attr('src');
      const synopsis = $(element).find('.col-synopsis > p').text().trim(); 
      const release_date = $(element).find('.col-anime-date').text().trim();

      animeList.push({
        title,
        anime_id,
        episode,
        rating,
        studio,
        genres,
        image,
        synopsis,
        release_date,
      });
    });

    const currentPage = parseInt($(".pagination .page-numbers.current").text());

    const nextPageLink = $(".pagination .next.page-numbers").attr("href");
    const hasNextPage = nextPageLink != null;

    const prevPageLink = $(".pagination .prev.page-numbers").attr("href");
    const hasPrevPage = prevPageLink != null;

    res.send({
      status: true,
      message: "success get genre details",
      data: animeList,
      pagination: {
        current_page: currentPage,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      }
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};

const getScheduleAnime = async (req, res) => {
  const url = `${baseUrl.anime}/jadwal-rilis/`;
  try {
    const data = await fetchData(url, res);
    const $ = cheerio.load(data);

    const scheduleList = [];

    $('.kglist321').each((index, element) => {
      const day = $(element).find('h2').text();
      const animeList = [];

      $(element).find('ul li').each((i, animeItem) => {
        const animeTitle = $(animeItem).find('a').text();
        const anime_id = $(animeItem).find('a').attr('href').split('/')[4];

        animeList.push({
          title: animeTitle,
          anime_id: anime_id,
        });
      });

      scheduleList.push({
        day: day,
        anime: animeList,
      });
    });

    res.send({
      status: true,
      message: "success get schedule anime",
      data: scheduleList,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
};


module.exports = {
  getOngoingAnime,
  getFinishedAnime,
  getListAnime,
  searchAnime,
  getAnimeDetails,
  getAnimeEpisode,
  getBatchAnime,
  getGenreList,
  getGenreDetails,
  getScheduleAnime,
};
