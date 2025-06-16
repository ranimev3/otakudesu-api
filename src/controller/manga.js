const cheerio = require("cheerio");
const axios = require("axios");
const baseUrl = require("../utils/constant/url");
const fetchData = require("../utils/helper/fetch");

const getManga = async (req, res) => {
    const { orderby, category_name, genre, genre2, status } = req.query;
    const page = req.params.page || 1;
    
    const apiUrl = `https://api.komiku.id/manga/page/${page}/?orderby=${orderby || ''}&category_name=${category_name || ''}&genre=${genre || ''}&genre2=${genre2 || ''}&status=${status || ''}`;

    console.log("Fetching URL:", apiUrl);

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Accept": "text/html",
            },
        });

        const result = response.data;
        const $ = cheerio.load(result);

        let manga = [];

        $(".bge").each((index, element) => {
            const title = $(element).find(".kan h3").text().trim();
            const id = $(element).find(".bgei a").attr("href")?.split("/")[4] || "";
            const image = $(element).find(".bgei img").attr("src") || "";
            const type = $(element).find(".tpe1_inf b").text().trim();
            const readers = $(element).find(".judul2").text().trim();
            const synopsis = $(element).find(".kan p").text().trim();

            const chapterAwal = $(element).find(".new1").first().text().trim();
            const chapterTerbaru = $(element).find(".new1").last().text().trim();

            manga.push({
                title,
                id,
                image,
                type,
                readers,
                synopsis,
                chapter_awal: chapterAwal,
                chapter_terbaru: chapterTerbaru,
            });
        });

        res.json({
            success: true,
            data: manga.length > 0 ? manga : "Data tidak ditemukan, cek kembali struktur HTML.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam mengambil data.",
            error: error.message,
        });
    }
};

const getMangaGenre = async (req, res) => {
    const { genre } = req.params;
    const { orderby, category_name } = req.query;
    const page = req.params.page || 1;

    const apiUrl = `https://api.komiku.id/genre/${genre}/page/${page}/?orderby=${orderby || ''}&category_name=${category_name || ''}`;

    console.log("Fetching URL:", apiUrl);

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Accept": "text/html",
            },
        });

        const result = response.data;
        const $ = cheerio.load(result);

        let manga = [];

        $(".bge").each((index, element) => {
            const title = $(element).find(".kan h3").text().trim();
            const id = $(element).find(".bgei a").attr("href")?.split("/")[4] || "";
            const image = $(element).find(".bgei img").attr("src") || "";
            const type = $(element).find(".tpe1_inf b").text().trim();
            const readers = $(element).find(".judul2").text().trim();
            const synopsis = $(element).find(".kan p").text().trim();

            const chapterAwal = $(element).find(".new1").first().text().trim();
            const chapterTerbaru = $(element).find(".new1").last().text().trim();

            manga.push({
                title,
                id,
                image,
                type,
                readers,
                synopsis,
                chapter_awal: chapterAwal,
                chapter_terbaru: chapterTerbaru,
            });
        });

        res.json({
            success: true,
            data: manga.length > 0 ? manga : "Data tidak ditemukan, cek kembali struktur HTML.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam mengambil data genre manga.",
            error: error.message,
        });
    }
};

const searchManga = async (req, res) => {
    const { post_type, s } = req.query;
    const page = req.params.page || 1;

    const apiUrl = `https://api.komiku.id/page/${page}/?post_type=${post_type || 'manga'}&s=${s || ''}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Accept": "text/html",
            },
        });

        const result = response.data;
        const $ = cheerio.load(result);

        let manga = [];

        $(".bge").each((index, element) => {
            const title = $(element).find(".kan h3").text().trim();
            const id = $(element).find(".bgei a").attr("href")?.split("/")[2] || "";
            const image = $(element).find(".bgei img").attr("src") || "";
            const type = $(element).find(".tpe1_inf b").text().trim();
            const readers = $(element).find(".judul2").text().trim();
            const synopsis = $(element).find(".kan p").text().trim();

            const chapterAwal = $(element).find(".new1").first().text().trim();
            const chapterTerbaru = $(element).find(".new1").last().text().trim();

            manga.push({
                title,
                id,
                image,
                type,
                readers,
                synopsis,
                chapter_awal: chapterAwal,
                chapter_terbaru: chapterTerbaru,
            });
        });

        res.json({
            success: true,
            data: manga.length > 0 ? manga : "Data tidak ditemukan, cek kembali struktur HTML.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam mengambil data genre manga.",
            error: error.message,
        });
    }
};


const getMangaDetails = async (req, res) => {
    const id = req.params.id;
    const url = `${baseUrl.manga}/manga/${id}`;
    
    try {
        const response = await fetchData(url, res);
        const $ = cheerio.load(response);

        let manga = {};

        $("#Informasi").each((index, element) => {
            const image = $(element).find(".ims img").attr("src");
            const title = $(element).find(".inftable tr:nth-child(1) td:nth-child(2)").text().trim();
            const indonesianTitle = $(element).find(".inftable tr:nth-child(2) td:nth-child(2)").text().trim();
            const type = $(element).find(".inftable tr:nth-child(3) td:nth-child(2) b").text().trim();
            const concept = $(element).find(".inftable tr:nth-child(4) td:nth-child(2)").text().trim();
            const author = $(element).find(".inftable tr:nth-child(5) td:nth-child(2)").text().trim();
            const status = $(element).find(".inftable tr:nth-child(6) td:nth-child(2)").text().trim();
            const ageRating = $(element).find(".inftable tr:nth-child(7) td:nth-child(2)").text().trim();
            const readingDirection = $(element).find(".inftable tr:nth-child(8) td:nth-child(2)").text().trim();

            let genres = [];
            $(element).find(".genre li a span").each((i, el) => {
                genres.push($(el).text().trim());
            });

            manga = {
                id,
                image,
                title,
                indonesianTitle,
                type,
                concept,
                author,
                status,
                ageRating,
                readingDirection,
                genres
            };
        });

        // Menambahkan daftar chapter
        let chapters = [];
        $("#daftarChapter tr").each((index, element) => {
            if (index === 0) return; // Lewati header tabel

            const chapterNumber = $(element).find(".judulseries a span").text().trim();
            const chapterId = $(element).find(".judulseries a").attr("href").split("/")[1];
            const views = $(element).find(".pembaca i").text().trim();
            const releaseDate = $(element).find(".tanggalseries").text().trim();

            if (chapterNumber && chapterId) {
                chapters.push({
                    chapterNumber,
                    chapterId,
                    views,
                    releaseDate
                });
            }
        });

        manga.chapters = chapters;

        res.status(200).json({
            success: true,
            data: manga
        });
        
            

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam mengambil data manga."
        });
    }
};

const getChapterImages = async (req, res) => {
    const id = req.params.id;
    const url = `${baseUrl.manga}/${id}`;
    
    try {
        const response = await fetchData(url, res);
        const $ = cheerio.load(response);

        const chapterTitle = $("table.tbl tbody[data-test='informasi'] tr:contains('Judul') td").last().text().trim();
        const releaseDate = $("table.tbl tbody[data-test='informasi'] tr:contains('Tanggal Rilis') td").last().text().trim();
        const readingDirection = $("table.tbl tbody[data-test='informasi'] tr:contains('Arah Baca') td").last().text().trim();

        let images = [];

        $("#Baca_Komik img").each((index, element) => {
            const image = $(element).attr("src");
            if (image) {
                images.push(image);
            }
        });

        res.status(200).json({
            success: true,
            data: {
                chapter_title: chapterTitle,
                release_date: releaseDate,
                reading_direction: readingDirection,
                images
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam mengambil data chapter."
        });
    }
};

const getAllManga = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const apiUrl = "https://komiku.id/daftar-komik/";

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/110.0.0.0 Safari/537.36",
                "Accept": "text/html",
            },
        });

        const result = response.data;
        const $ = cheerio.load(result);

        let mangaList = [];
        let totalManga = $(".ls4").length;

        // Ambil hanya elemen yang sesuai dengan halaman yang diminta
        $(".ls4").slice((page - 1) * perPage, page * perPage).each((_, element) => {
            const title = $(element).find("h4 a").text().trim();
            const id = $(element).find(".ls4v a").attr("href")?.split("/")[2] || "";
            const image = $(element).find(".ls4v img").attr("data-src") || $(element).find(".ls4v img").attr("src") || "";
            const genre = $(element).find(".ls4s").first().text().trim();
            const status = $(element).find(".ls4s").eq(1).text().trim();
            const lastUpdate = $(element).find(".ls4s").eq(2).text().trim();

            mangaList.push({
                title,
                id,
                image,
                genre,
                status,
                lastUpdate,
            });
        });

        res.json({
            success: true,
            currentPage: page,
            perPage,
            totalManga,
            totalPages: Math.ceil(totalManga / perPage),
            data: mangaList.length > 0 ? mangaList : "Tidak ada data untuk halaman ini.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam mengambil daftar manga.",
            error: error.message,
        });
    }
};




module.exports = { getManga, getMangaDetails, getChapterImages, getMangaGenre, getAllManga, searchManga };
