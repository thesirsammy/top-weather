const images = require.context('./img/icons', false, /\.(png|jpe?g|svg)$/);
const imageMap = images.keys().reduce((map, path) => {
  const key = path.replace('./', '');
  map[key] = images(path);
  return map;
}, {});

const API_KEY = "7ec4ec4f4af5afd48bea808866f5fc7a"
let state;

export async function toCoords(query) {
  try {
    const geoResponse = await fetch(`http://pro.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`,
      { mode: 'cors' }
    )
    const coords = await geoResponse.json();
    state = coords[0].state;
    return `lat=${coords[0].lat}&lon=${coords[0].lon}`;
  } catch (error) {
    console.error("Error in toCoords:", error);
    throw error;
  }
}

export async function getData(coords) {
  try {
    const dayResponse = await fetch(`https://pro.openweathermap.org/data/2.5/weather?${coords}&units=imperial&appid=${API_KEY}`, 
      { mode: 'cors' }
    );
    const dayData = await dayResponse.json();

    // const hourResponse = await fetch(`https://pro.openweathermap.org/data/2.5/forecast/hourly?q=${LOCATION}&cnt=5&appid=${API_KEY}`, 
    //   {mode: 'cors'}
    // );
    // const hourData = await hourResponse.json();
    // const hourArray = hourData.list.map((element) => element);

    document.getElementById('location').innerText = `${dayData.name}${(state) ? ", " + state : ""}`;
    document.getElementById('temp').innerText = Math.round(dayData.main.temp) + "˚";
    document.getElementById('icon').src = imageMap[`${dayData.weather[0].icon}.svg`];
    document.getElementById('desc').innerText = dayData.weather[0].main;
    document.getElementById('high').innerText = `High: ${Math.round(dayData.main.temp_max)}˚`;
    document.getElementById('low').innerText = `Low: ${Math.round(dayData.main.temp_min)}˚`;
    document.getElementById('feelsLike').innerText = Math.round(dayData.main.feels_like) + "˚";
    document.getElementById('wind').innerText = Math.round(dayData.wind.speed) + 'mph';
    document.getElementById('rain').innerText = dayData.rain ? (Math.floor((dayData.rain['1h']/24.2)*100))/100 + '"' : 'None';
    document.getElementById('humidity').innerText = dayData.main.humidity + "%";

    console.log(dayData);
  } catch (error) {
    console.log(error);
  }
}