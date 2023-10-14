/*getData("Zagreb").then(processedWeatherData => {
    console.log(processedWeatherData);
    populateHeader(processedWeatherData)
    generateDOM(processedWeatherData);
});*/

const searchBar = document.getElementById("enter");
searchBar.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        const cityName = searchBar.value;
        getData(cityName).then(processedWeatherData => {
            console.log(processedWeatherData);
            generateDOM(processedWeatherData);
            populateStaticData(processedWeatherData);
        });
    }
});

async function getData(cityName) {
    const response = await fetch('https://api.weatherapi.com/v1/forecast.json?key=cd0065695f244f8783a190858232909&q=' + cityName + '&days=3', {mode: 'cors'});
    const weatherData = await response.json();
    // console.log(weatherData);
    return processData(weatherData);
}

function processData(data) {
    const currentData = new City(data.location.name,
                                data.location.country,
                                data.location.localtime,
                                data.current.is_day,
                                data.current.condition.code,
                                data.current.condition.text,
                                data.current.temp_c,
                                data.current.feelslike_c,
                                data.current.wind_kph,
                                data.current.humidity,
                                data.current.uv
                                );

    const forecastDays = [];
    data.forecast.forecastday.forEach((forecastday) => {
        const day  = new Day(forecastday.date,
                            forecastday.day.condition.code,
                            forecastday.day.condition.text,
                            forecastday.day.mintemp_c,
                            forecastday.day.maxtemp_c,
                            forecastday.day.maxwind_kph,
                            );
        forecastDays.push(day);
    });

    return {
        currentData: currentData,
        forecastDays: forecastDays,
    };
}

class City {
    constructor(city, country, time, isDay, code, condition, temperature, feelsLike, wind, humidity, uv) {
        this.city = city;
        this.country = country;
        this.time = time;
        this.isDay = isDay;
        this.code = code;
        this.condition = condition;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.wind = wind;
        this.humidity = humidity;
        this.uv = uv;
    }
}

class Day {
    constructor(date, code, condition, mintemp_c, maxtemp_c, maxwind_kph) {
        this.date = date;
        this.code = code;
        this.condition = condition;
        this.mintemp_c = mintemp_c;
        this.maxtemp_c = maxtemp_c;
        this.maxwind_kph = maxwind_kph;
    }
}

function populateStaticData(data) {

    // Populate header
    const city = document.querySelector(".city");
    const country = document.querySelector(".country");
    const time = document.querySelector(".time");
    const temperature = document.querySelector(".temperature");
    const feelsLike = document.querySelector(".feelsLike");
    const image = document.getElementById("currentWeather");

    city.textContent = data.currentData.city;
    country.textContent = data.currentData.country;
    time.textContent = data.currentData.time;
    temperature.textContent = data.currentData.temperature + "°";
    feelsLike.textContent = "Feels like " + data.currentData.feelsLike + "°";


    // Populate today's conditions
    const wind = document.querySelector(".wind");
    const humidity = document.querySelector(".humidity");
    const uv = document.querySelector(".uv");

    wind.textContent = data.currentData.wind + " km/h";
    humidity.textContent = data.currentData.humidity + "%";
    uv.textContent = data.currentData.uv;


    checkWeather(data.currentData, image);
}

function generateDOM(data) {

    //generateTodayForecast(data);
    generateWeekForecast(data);

}

function generateWeekForecast(data) {

    const section = document.querySelector(".day-forecast");
    section.innerHTML = '';

    data.forecastDays.forEach(day => {

        const divDay = document.createElement("div");
        divDay.classList.add("day");

        const dayName = document.createElement("h3");
        const image = document.createElement("img");
        const minMaxTemp = document.createElement("h3");
        
        dayName.textContent = day.date;
        checkWeather(day, image);
        minMaxTemp.textContent = day.maxtemp_c + "°/" + day.mintemp_c + "°";

        divDay.appendChild(dayName);
        divDay.appendChild(image);
        divDay.appendChild(minMaxTemp);

        section.appendChild(divDay);
    });
}

function checkWeather(day, image) {

    const background = document.querySelector("body");
    
    if (day.isDay === 0){
        image.src = "images/night-clear.png";
    } else if (day.code === 1000) {
        image.src = "images/sunny.png";
    } else if (day.code === 1003) {
        image.src = "images/partially-cloudy.png";
    } else if (day.code >= 1006 && day.code <= 1030) {
        image.src = "images/cloudy.png";
    } else if (day.code >= 1063 && day.code <= 1282) {
        image.src = "images/rainy.png"
    }

    if (day.isDay === 0 || day.code >= 1006 && day.code <= 1282) {
        background.style.backgroundImage = "linear-gradient(to bottom left, #615F8E, #53568D)";
    } else {
        background.style.backgroundImage = "linear-gradient(to bottom left, #84B9FC, #74B1F0)";
    }
}