const Axios = require("axios");
const qs = require("qs");
const cheerio = require("cheerio");
const baseUrl = require("../constant/url");

const getNonce = async () => {
  let payload = {
    action: "aa1208d27f29ca340c92c66d1926f13f",
  };

  try {
    let url = `${baseUrl}/wp-admin/admin-ajax.php`;
    const response = await Axios.post(url, qs.stringify(payload), {
      headers: {
        Origin: baseUrl,
        Cookie:
          "_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1",
        Referer: baseUrl,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0",
        "X-Requested-With": "XMLHttpRequest",
        // 'Host': baseUrl,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    return response.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getUrlAjax = async (content, nonce) => {
  try {
    let _e = JSON.parse(atob(content));
    let payload = {
      ..._e,
      nonce: nonce,
      action: "2a3505c93b0035d3f455df82bf976b84",
    };

    let url = `${baseUrl}/wp-admin/admin-ajax.php`;
    const response = await Axios.post(url, qs.stringify(payload), {
      headers: {
        Origin: baseUrl,
        Cookie:
          "_ga=GA1.2.826878888.1673844093; _gid=GA1.2.1599003702.1674031831; _gat=1",
        Referer: baseUrl,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0",
        "X-Requested-With": "XMLHttpRequest",
        // 'Host': baseUrl,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    return atob(response.data.data);
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

const notFoundQualityHandler = (res, num) => {
  const $ = cheerio.load(res);
  const download_links = [];
  const element = $(".download");
  let response;

  element.filter(function () {
    if ($(this).find(".anime-box > .anime-title").eq(0).text() === "") {
      $(this)
        .find(".yondarkness-box")
        .filter(function () {
          const quality = $(this)
            .find(".yondarkness-title")
            .eq(num)
            .text()
            .split("[")[1]
            .split("]")[0];
          const size = $(this)
            .find(".yondarkness-title")
            .eq(num)
            .text()
            .split("]")[1]
            .split("[")[1];
          $(this)
            .find(".yondarkness-item")
            .eq(num)
            .find("a")
            .each((idx, el) => {
              const _list = {
                host: $(el).text(),
                link: $(el).attr("href"),
              };
              download_links.push(_list);
              response = { quality, size, download_links };
            });
        });
    } else {
      $(this)
        .find(".anime-box")
        .filter(function () {
          const quality = $(this)
            .find(".anime-title")
            .eq(num)
            .text()
            .split("[")[1]
            .split("]")[0];
          const size = $(this)
            .find(".anime-title")
            .eq(num)
            .text()
            .split("]")[1]
            .split("[")[1];
          $(this)
            .find(".anime-item")
            .eq(num)
            .find("a")
            .each((idx, el) => {
              const _list = {
                host: $(el).text(),
                link: $(el).attr("href"),
              };
              download_links.push(_list);
              response = { quality, size, download_links };
            });
        });
    }
  });
  return response;
};

const epsQualityFunction = (num, res) => {
  const $ = cheerio.load(res);
  const element = $(".download");
  const download_links = [];
  let response;

  element.find("ul").filter(function () {
    const quality = $(this).find("li").eq(num).find("strong").text();
    const size = $(this).find("li").eq(num).find("i").text();
    $(this)
      .find("li")
      .eq(num)
      .find("a")
      .each(function () {
        const _list = {
          host: $(this).text(),
          link: $(this).attr("href"),
        };
        download_links.push(_list);
        response = { quality, size, download_links };
      });
  });
  return response;
};

const processDownloadLinks = ($, element) => {
  const downloadLinks = {
    mp4: {
      "360p": [],
      "480p": [],
      "720p": []
    },
    mkv: {
      "480p": [],
      "720p": [],
      "1080p": []
    }
  };

  element.find("li").each((_, li) => {
    const qualityText = $(li).find("strong").text().toLowerCase();
    const size = $(li).find("i").text();

    $(li).find("a").each((_, anchor) => {
      const host = $(anchor).text();
      const link = $(anchor).attr("href");
      const downloadInfo = { host, link, size };

      // Default assumptions for format based on quality
      let isMp4 = true;

      // Determine format explicitly if possible
      if (qualityText.includes("mkv")) {
        isMp4 = false;
      } else if (qualityText.includes("mp4")) {
        isMp4 = true;
      }

      // Determine quality and map to the appropriate format
      if (qualityText.includes("360")) {
        if (isMp4) downloadLinks.mp4["360p"].push(downloadInfo);
      } else if (qualityText.includes("480")) {
        if (isMp4) downloadLinks.mp4["480p"].push(downloadInfo);
        else downloadLinks.mkv["480p"].push(downloadInfo);
      } else if (qualityText.includes("720")) {
        if (isMp4) downloadLinks.mp4["720p"].push(downloadInfo);
        else downloadLinks.mkv["720p"].push(downloadInfo);
      } else if (qualityText.includes("1080")) {
        if (!isMp4) downloadLinks.mkv["1080p"].push(downloadInfo);
      }
    });
  });

  // Clean up empty categories
  Object.keys(downloadLinks).forEach(format => {
    Object.keys(downloadLinks[format]).forEach(quality => {
      if (downloadLinks[format][quality].length === 0) {
        delete downloadLinks[format][quality];
      }
    });
    if (Object.keys(downloadLinks[format]).length === 0) {
      delete downloadLinks[format];
    }
  });

  return downloadLinks;
};

module.exports = {
  getNonce,
  getUrlAjax,
  notFoundQualityHandler,
  epsQualityFunction,
  processDownloadLinks,
};
