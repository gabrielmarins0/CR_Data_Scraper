let basicAuthToken = "Basic Y3Jfd2ViOg==";
let animesRequestNumber = 1600;
let startAnimeIndex = 0; //gintama = 441
let preferLocale = "pt-BR";
let delayRequest = 30;

async function getToken() {
  const tokenResponse = await fetch("https://beta-api.crunchyroll.com/auth/v1/token", {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      authorization: basicAuthToken,
      "content-type": "application/x-www-form-urlencoded",
      "etp-anonymous-id": "0c2b7bb2-4bb2-4df4-a95e-8d212f80e595",
      "sec-ch-ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
    },
    referrer: "https://www.crunchyroll.com/",
    referrerPolicy: "origin-when-cross-origin",
    body: "grant_type=client_id",
    method: "POST",
    mode: "cors",
    credentials: "include",
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  return `Bearer ${accessToken}`;
}

async function myFetch(url, referer, bearer) {
  return fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      authorization: bearer,
      "sec-ch-ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: referer,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }).then((response) => response.json());
}

async function getAnimes(bearer) {
  let myJson = {};
  let stopper = false;

  while (stopper === false) {
    let json = await myFetch(
      `https://www.crunchyroll.com/content/v2/discover/browse?start=${startAnimeIndex}&n=${animesRequestNumber}&type=series&sort_by=alphabetical&locale=${preferLocale}`,
      `https://www.crunchyroll.com/${preferLocale.toLocaleLowerCase()}/videos/alphabetical`,
      bearer
    );
    if (json.total == 0) {
      stopper = true;
    }
    let animes = json.data;
    for (var anime of animes) {
      let title = anime.title;
      myJson[title] = {
        description: anime.description,
        episode_count: anime.series_metadata.episode_count,
        seasons_data: {},
        series_launch_year: anime.series_metadata.series_launch_year,
        subtitle_locales: anime.series_metadata.subtitle_locales,
        maturity_ratings: anime.series_metadata.maturity_ratings,
        id: anime.id,
        image: anime.images.poster_tall[0][2].source,
      };
      start += animesRequestNumber;
      stopper = true;
    }
  }
  console.log("Animes obtidos:", Object.keys(myJson).length);
  return myJson;
}

async function getSeasons(animesJson, bearer) {
  let promises = [];
  let delay = delayRequest;
  for (let animeTitle in animesJson) {
    let promise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        let animeId;
        try {
          try {
            animeId = animesJson[animeTitle].id;
          } catch (error) {
            console.error(`Erro ao obter animeID para ${animesJson.animeTitle}:`, error);
          }

          let json = await myFetch(`https://www.crunchyroll.com/content/v2/cms/series/${animeId}/seasons?force_locale=&locale=${preferLocale}`, `https://www.crunchyroll.com/${preferLocale.toLocaleLowerCase()}/series/${animeId}`, bearer);

          if (json.error) {
            console.error(`Erro ao obter temporadas para o anime ${animeTitle}:`, json.error);
            reject(json.error);
          } else {
            json.data.forEach((season) => {
              animesJson[animeTitle].seasons_data[`${season.season_sequence_number}`] = {
                id: season.id,
              };
            });
            console.log(`Temporadas obtidas para o anime ${animeTitle}:`, json.data.length);
            resolve();
          }
        } catch (error) {
          console.error(`Erro ao obter temporadas para o anime https://www.crunchyroll.com/content/v2/cms/series/${animeId}/seasons?force_locale=&locale=${preferLocale} - ${animeTitle}: `, error);
          reject(error);
        }
      }, delay);
    });
    promises.push(promise);
    delay += delayRequest;
  }
  await Promise.allSettled(promises);

  console.log("Temporadas obtidas para todos os animes.");
  return animesJson;
}

async function getEpisodes(seasonsJson, bearer) {
  let promises = [];
  let delay = delayRequest;
  for (let animeTitle in seasonsJson) {
    for (let seasonNumber of Object.keys(seasonsJson[animeTitle].seasons_data)) {
      let seasonId = seasonsJson[animeTitle].seasons_data[seasonNumber].id;
      let animeId = seasonsJson[animeTitle].id;
      let promise = new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            let json = await myFetch(`https://www.crunchyroll.com/content/v2/cms/seasons/${seasonId}/episodes?locale=${preferLocale}`, `https://www.crunchyroll.com/${preferLocale.toLocaleLowerCase()}/series/${animeId}`, bearer);
            json.data.forEach((episode) => {
              const targetSeason = seasonsJson[animeTitle].seasons_data[seasonNumber];
              if (!targetSeason.episodes) {
                targetSeason.episodes = {};
              }
              const episodesByLocale = targetSeason.episodes;
              if (!episode.versions) {
                const locale = episode.audio_locale;
                if (!episodesByLocale[locale]) {
                  episodesByLocale[locale] = [];
                }
                episodesByLocale[locale].push({
                  episode_number: episode.episode_number,
                  guid: `https://www.crunchyroll.com/${preferLocale.toLocaleLowerCase()}/watch/${episode.id}`,
                  is_premium_only: episode.is_premium_only,
                });
              } else {
                episode.versions.forEach((version) => {
                  const locale = version.audio_locale;
                  if (!episodesByLocale[locale]) {
                    episodesByLocale[locale] = [];
                  }
                  episodesByLocale[locale].push({
                    episode_number: episode.episode_number,
                    guid: `https://www.crunchyroll.com/watch/${version.guid}`,
                    title: episode.title,
                    is_premium_only: version.is_premium_only,
                  });
                });
              }
            });
            console.log("Episodios obtidos para a temporada " + seasonId + " do anime " + animeTitle + ": " + json.data.length);
            resolve();
          } catch (error) {
            console.error(`Erro ao obter episódios para a temporada ${seasonId} do anime ${animeTitle}: `, error);
            reject(error);
          }
        }, delay);
      });
      promises.push(promise);
      delay += delayRequest;
    }
  }
  await Promise.allSettled(promises);
  console.log("Episódios obtidos para todos os animes.");

  return seasonsJson;
}

async function createHTML(episodesJson) {
  let htmlString = `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>CR Data Scraper</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
  
        body {
          font-family: Arial, sans-serif;
          padding-left: 30px;
          padding-right: 30px;
          background: papayawhip;
        }
  
        h1 {
          text-align: center;
          margin: 20px 0;
        }
  
        .data {
          max-width: 1920px;
          margin: auto;
        }
  
        .anime {
          margin-bottom: 20px;
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
  
        .content {
          max-width: 1000px;
          display: flex;
          flex-wrap: nowrap;
          gap: 20px;
        }
  
        .image img {
          max-width: 240px;
          height: auto;
          border-radius: 5px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
        }
  
        .info {
          flex-grow: 1;
        }
  
        .anime-title {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 10px;
        }
  
        .description {
          margin-bottom: 15px;
        }
  
        .episode-count,
        .launch-year,
        .subtitle-locales,
        .maturity-ratings,
        .anime-id {
          margin-bottom: 10px;
        }
  
        .seasons {
          margin-top: 20px;
        }
  
        .season {
          margin-bottom: 20px;
        }
  
        .season-number {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 10px;
        }
  
        .languages {
          display: flex;
          flex-wrap: wrap;
        }
  
        .language {
          margin-left: 20px;
        }
  
        .language-code {
          font-weight: bold;
          margin-bottom: 5px;
        }
  
        .episode {
          display: flex;
          border-bottom: 1px solid #ddd;
        }
  
        .episode div {
          padding: 10px 10px 10px 0px;
        }
  
        .episode-link a {
          text-decoration: none;
          color: #007bff;
          font-weight: bold;
        }
  
        .episode-link a:hover {
          text-decoration: underline;
        }
  
        @media (max-width: 768px) {
          .content {
            flex-direction: column;
          }
  
          .languages {
            flex-direction: column;
          }
  
          .episode {
            flex-direction: column;
          }
  
          .episode div {
            padding: 5px;
          }
        }
  
        .language-code {
          display: inline-block;
          padding: 8px 16px;
          background-color: #4caf50;
          color: white;
          text-align: center;
          text-decoration: none;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
        }
  
        .language-code:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
      <h1>CR Data Scraper</h1>
      <div class="data">
        <ul class="animes"></ul>
      </div>
      <script>
        function copyLinks(event) {
          
          let links = [];
          let episodeLinks = event.target.nextElementSibling.querySelectorAll("a");
          episodeLinks.forEach((link) => {
            links.push(link.href);
          });
          navigator.clipboard
            .writeText(links.join("\\n"))
            .then(() => {
              alert("Links copiados para a área de transferência.");
            })
            .catch((error) => {
              console.error("Erro ao copiar os links: ", error);
            });
        }
      </script>
    </body>
  </html>
  `;

  let parser = new DOMParser();
  let doc = parser.parseFromString(htmlString, "text/html");

  for (let animeTitle in episodesJson) {
    let anime = episodesJson[animeTitle];

    let animesList = doc.querySelector(".animes");

    let divAnime = document.createElement("div");
    divAnime.setAttribute("class", "anime");
    let divAnimeTitle = document.createElement("div");
    divAnimeTitle.setAttribute("class", "anime-title");
    divAnimeTitle.textContent = animeTitle; // Adiciona o título do anime
    let divContent = document.createElement("div");
    divContent.setAttribute("class", "content");
    let divImage = document.createElement("div");
    divImage.setAttribute("class", "image");
    let img = document.createElement("img");
    img.setAttribute("src", anime.image);
    let divInfo = document.createElement("div");
    divInfo.setAttribute("class", "info");
    let pDescription = document.createElement("p");
    pDescription.setAttribute("class", "description");
    pDescription.textContent = anime.description;
    let pEpisodeCount = document.createElement("p");
    pEpisodeCount.setAttribute("class", "episode-count");
    pEpisodeCount.textContent = `Total de episódios: ${anime.episode_count}`;
    let pLaunchYear = document.createElement("p");
    pLaunchYear.setAttribute("class", "launch-year");
    pLaunchYear.textContent = `Ano de lançamento: ${anime.series_launch_year}`;
    let pSubtitleLocales = document.createElement("p");
    pSubtitleLocales.setAttribute("class", "subtitle-locales");
    pSubtitleLocales.textContent = `Legendas disponíveis: ${anime.subtitle_locales.join(", ")}`;
    let pMaturityRatings = document.createElement("p");
    pMaturityRatings.setAttribute("class", "maturity-ratings");
    pMaturityRatings.textContent = `Classificação indicativa: ${anime.maturity_ratings.join(", ")}`;
    let pAnimeId = document.createElement("p");
    pAnimeId.setAttribute("class", "anime-id");
    pAnimeId.textContent = `ID do anime: ${anime.id}`;
    let divSeasons = document.createElement("div");
    divSeasons.setAttribute("class", "seasons");

    divAnime.appendChild(divContent);
    divContent.appendChild(divImage);
    divImage.appendChild(img);
    divContent.appendChild(divInfo);
    divInfo.appendChild(divAnimeTitle);
    divInfo.appendChild(pDescription);
    divInfo.appendChild(pEpisodeCount);
    divInfo.appendChild(pLaunchYear);
    divInfo.appendChild(pSubtitleLocales);
    divInfo.appendChild(pMaturityRatings);
    divInfo.appendChild(pAnimeId);
    divAnime.appendChild(divSeasons);

    for (let seasonNumber in anime.seasons_data) {
      let divSeason = document.createElement("div");
      divSeason.setAttribute("class", "season");
      let divSeasonNumber = document.createElement("div");
      divSeasonNumber.setAttribute("class", "season-number");
      divSeasonNumber.textContent = `S${seasonNumber}`;
      let divLanguages = document.createElement("div");
      divLanguages.setAttribute("class", "languages");

      divSeason.appendChild(divSeasonNumber);
      divSeason.appendChild(divLanguages);

      for (let languageCode in anime.seasons_data[seasonNumber].episodes) {
        let divLanguage = document.createElement("div");
        divLanguage.setAttribute("class", "language");
        let divLanguageCode = document.createElement("div");
        divLanguageCode.setAttribute("class", "language-code");
        divLanguageCode.setAttribute("onclick", "copyLinks(event)");
        let divEpisodes = document.createElement("div");
        divEpisodes.setAttribute("class", "episodes");

        divLanguage.appendChild(divLanguageCode);
        divLanguage.appendChild(divEpisodes);

        anime.seasons_data[seasonNumber].episodes[languageCode].forEach((episode) => {
          let divEpisode = document.createElement("div");
          divEpisode.setAttribute("class", "episode");
          let divEpisodeNumber = document.createElement("div");
          divEpisodeNumber.setAttribute("class", "episode-number");
          let divEpisodeLink = document.createElement("div");
          divEpisodeLink.setAttribute("class", "episode-link");
          let a = document.createElement("a");
          a.setAttribute("href", episode.guid);
          a.setAttribute("target", "_blank");
          a.textContent = `Episódio ${episode.episode_number} - ${episode.is_premium_only ? "Premium" : "Free"}`;

          divEpisode.appendChild(divEpisodeNumber);
          divEpisodeLink.appendChild(a);
          divEpisode.appendChild(divEpisodeLink);
          divEpisodes.appendChild(divEpisode);
        });

        divLanguages.appendChild(divLanguage);

        let totalEpisodes = anime.seasons_data[seasonNumber].episodes[languageCode].length;
        let freeEpisodesCount = anime.seasons_data[seasonNumber].episodes[languageCode].filter((episode) => episode.is_premium_only === false).length;
        let percentegeFreeEpisodes = ((freeEpisodesCount / totalEpisodes) * 100).toFixed(0);
        divLanguageCode.textContent = `Audio ${languageCode} - ${totalEpisodes} episódios (${percentegeFreeEpisodes}% grátis)`;
      }

      divSeasons.appendChild(divSeason);
    }

    animesList.appendChild(divAnime);
  }
  return doc.documentElement.outerHTML;
}

async function createAndDownload(htmlContent, episodesJson) {
  try {
    let htmlBlob = new Blob([htmlContent], { type: "text/html" });
    let jsonBlob = new Blob([JSON.stringify(episodesJson)], { type: "application/json" });

    let htmlLink = document.createElement("a");
    htmlLink.href = URL.createObjectURL(htmlBlob);
    htmlLink.download = "index.html";
    htmlLink.click();

    let jsonLink = document.createElement("a");
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = "data.json";
    jsonLink.click();

    return;
  } catch (error) {
    console.error("Erro ao baixar os arquivos HTML e JSON:", error);
    return;
  }
}

async function start() {
  const startTime = new Date();

  let bearer = await getToken();
  let animesJson = await getAnimes(bearer);
  let seasonsJson = await getSeasons(animesJson, bearer);
  let episodesJson = await getEpisodes(seasonsJson, bearer);
  let htmlContent = await createHTML(episodesJson);
  await createAndDownload(htmlContent, episodesJson);

  const endTime = new Date();
  const elapsedTime = new Date(endTime - startTime);
  const hours = String(elapsedTime.getUTCHours()).padStart(2, "0");
  const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, "0");
  console.log(`Tempo total de execução: ${hours}:${minutes}:${seconds}`);
}

start();
