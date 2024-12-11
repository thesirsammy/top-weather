const images = require.context("./img/icons", false, /\.(png|jpe?g|svg)$/);
const imageMap = images.keys().reduce((map, path) => {
  const key = path.replace("./", "");
  map[key] = images(path);
  return map;
}, {});

const API_KEY = "7ec4ec4f4af5afd48bea808866f5fc7a";
const UNITS = "imperial";
let state;

/**
 * Converts a location to geological coordinates using OpenWeatherMap's
 * reverse geocoder
 *
 * @param {String} query Location
 * @returns {Promise} Coordinates
 */

export async function toCoords(query) {
  try {
    const geoResponse = await fetch(
      `https://pro.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`,
      { mode: "cors" },
    );
    const coords = await geoResponse.json();
    state = coords[0].state;
    return `lat=${coords[0].lat}&lon=${coords[0].lon}`;
  } catch (error) {
    console.error("Error in toCoords:", error);
    throw error;
  }
}

/**
 * Takes a set of coordinates and displays the weather
 *
 * @param {Promise} coords
 * @returns {any}
 *
 */

export async function getData(coords) {
  try {
    // Fetch current data
    const dayResponse = await fetch(
      `https://pro.openweathermap.org/data/2.5/weather?${coords}&units=${UNITS}&appid=${API_KEY}`,
      { mode: "cors" },
    );
    const dayData = await dayResponse.json();

    // Assign data to DOM
    document.getElementById("location").innerText =
      `${dayData.name}${state ? ", " + state : " (Current Location)"}`;
    document.getElementById("temp").innerText =
      Math.round(dayData.main.temp) + "˚";
    document.getElementById("icon").src =
      imageMap[`${dayData.weather[0].icon}.svg`];
    document.getElementById("desc").innerText = dayData.weather[0].main;
    document.getElementById("high").innerText =
      `High: ${Math.round(dayData.main.temp_max)}˚`;
    document.getElementById("low").innerText =
      `Low: ${Math.round(dayData.main.temp_min)}˚`;
    document.getElementById("feelsLike").innerText =
      Math.round(dayData.main.feels_like) + "˚";
    document.getElementById("wind").innerText =
      Math.round(dayData.wind.speed) + "mph";
    document.getElementById("rain").innerText = dayData.rain
      ? Math.floor((dayData.rain["1h"] / 24.2) * 100) / 100 + '"'
      : "None";
    document.getElementById("humidity").innerText = dayData.main.humidity + "%";

    // Fetch hourly forecast data
    const hourResponse = await fetch(
      `https://pro.openweathermap.org/data/2.5/forecast/hourly?${coords}&cnt=5&units=${UNITS}&appid=${API_KEY}`,
      { mode: "cors" },
    );
    const hourData = await hourResponse.json();
    const hourArray = hourData.list.map((element) => element); // Assign data to an array

    // Assign hourly forcast array to DOM
    for (let i = 0; i < hourArray.length; i++) {
      const date = new Date(hourArray[i].dt * 1000);
      const readableDate = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      document.getElementById(`hour${i + 1}`).innerText = readableDate
        .replace(" AM", " am")
        .replace(" PM", " pm");
      document.getElementById(`hour${i + 1}img`).src =
        imageMap[`${hourArray[i].weather[0].icon}.svg`];
      document.getElementById(`hour${i + 1}temp`).innerText =
        Math.round(hourArray[i].main.temp) + "˚";
    }

    // Fetch 10-Day forecast data
    const weekResponse = await fetch(
      `https://pro.openweathermap.org/data/2.5/forecast/daily?${coords}&cnt=10&units=imperial&appid=${API_KEY}`,
      { mode: "cors" },
    );
    const weekData = await weekResponse.json();
    const weekArray = weekData.list.map((element) => element);

    for (let i = 0; i < weekArray.length; i++) {
      const date = new Date(weekArray[i].dt * 1000);
      const readableDate = date.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      document.getElementById(`weekDate${i + 1}`).innerText = readableDate;
      document.getElementById(`weekTemp${i + 1}`).innerText =
        Math.round(weekArray[i].temp.day) + "˚";
      document.getElementById(`weekImg${i + 1}`).src =
        imageMap[`${weekArray[i].weather[0].icon}.svg`];
      document.getElementById(`weekDesc${i + 1}`).innerText =
        weekArray[i].weather[0].main;
      document.getElementById(`weekRange${i + 1}`).innerText =
        "L:" +
        Math.round(weekArray[i].temp.min) +
        "˚" +
        " H:" +
        Math.round(weekArray[i].temp.max) +
        "˚";
    }

    // Display loader for a second
    await new Promise((resolve) => setTimeout(resolve, 400));
    document.getElementById("loader").style.display = "none";
  } catch (error) {
    console.log(error);
  }
}
