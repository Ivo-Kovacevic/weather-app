getData("Zagreb").then(processedWeatherData => {
    console.log(processedWeatherData);
    populateHeader(processedWeatherData)
    generateDOM(processedWeatherData);
});

const searchBar = document.getElementById("city");
searchBar.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        const cityName = searchBar.value;
        getData(cityName).then(processedWeatherData => {
            console.log(processedWeatherData);
            generateDOM(processedWeatherData);
            populateHeader(processedWeatherData);
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
                                data.current.humidity
                                );

    const forecast = [];
    data.forecast.forecastday.forEach((forecastday) => {
        const day  = new Day(forecastday.day.condition.code,
                            forecastday.day.condition.text,
                            forecastday.day.mintemp_c,
                            forecastday.day.maxtemp_c,
                            forecastday.day.maxwind_kph
                            );
        forecast.push(day);
    });

    return {
        currentData: currentData,
        forecast: forecast,
    };
}

class City {
    constructor(city, country, time, isDay, code, condition, temp, feelsLike, wind, humidity) {
        this.location = {
            city: city,
            country: country,
            time: time,
        };
        this.currentWeather = {
            isDay: isDay,
            code: code,
            condition: condition,
            temp: temp,
            feelsLike: feelsLike,
            wind: wind,
            humidity: humidity,
        };
    }
}

class Day {
    constructor(code, condition, mintemp_c, maxtemp_c, maxwind_kph) {
        this.code = code;
        this.condition = condition;
        this.mintemp_c = mintemp_c;
        this.maxtemp_c = maxtemp_c;
        this.maxwind_kph = maxwind_kph;
    }
}

function populateHeader(processedWeatherData) {

    const temp = document.querySelector(".temp");
    const feelsLike = document.querySelector(".feelsLike");
    const image = document.querySelector(".header-image");
    const wind = document.querySelector(".header-wind");
    const humidity = document.querySelector(".humidity");
    const city = document.querySelector(".city");
    const country = document.querySelector(".country");
    const imageWind = document.createElement("img");
    const imageHumidity = document.createElement("img");

    imageWind.src = "images/wind.png";
    imageHumidity.src = "images/humidity.png";
    wind.innerHTML = '';
    humidity.innerHTML = '';
    wind.appendChild(imageWind);
    wind.append(processedWeatherData.currentData.currentWeather.wind + " km/h");
    humidity.appendChild(imageHumidity);
    humidity.append(processedWeatherData.currentData.currentWeather.humidity + "%");

    temp.textContent = processedWeatherData.currentData.currentWeather.temp;
    feelsLike.textContent = "Feels like " + processedWeatherData.currentData.currentWeather.feelsLike + "°";
    checkWeather(processedWeatherData.currentData.currentWeather, image);

    city.textContent = processedWeatherData.currentData.location.city;
    country.textContent = processedWeatherData.currentData.location.country;
}

function generateDOM(processedWeatherData) {

    forecastSection = document.querySelector('.forecast');
    forecastSection.innerHTML = ''

    processedWeatherData.forecast.forEach((day, index) => {

        const dayDiv = document.createElement("div");
        dayDiv.classList.add("day");

        const dayName = document.createElement("h3");
        if (index === 0) {
            dayName.textContent = "Today";
        } else if (index === 1) {
            dayName.textContent = "Tomorrow";
        } else {
            dayName.textContent = "Day after tomorrow"
        }

        const dayImage = document.createElement("img");
        checkWeather(day, dayImage);

        const minMaxDiv = document.createElement("div");
        minMaxDiv.classList.add("min-max");
        const minTemp = document.createElement("h2");
        const maxTemp = document.createElement("h2");
        minTemp.classList.add("min-temp");
        maxTemp.classList.add("max-temp");
        minTemp.textContent = day.mintemp_c + '°';
        maxTemp.textContent = day.maxtemp_c + '°';

        const windDiv = document.createElement("div");
        windDiv.classList.add("wind");
        const windImage = document.createElement("img");
        windImage.src = "images/wind.png";
        
        dayDiv.appendChild(dayName);
        dayDiv.appendChild(dayImage);
        minMaxDiv.appendChild(minTemp);
        minMaxDiv.appendChild(maxTemp);
        dayDiv.appendChild(minMaxDiv);
        windDiv.appendChild(windImage);
        windDiv.append(day.maxwind_kph + "km/h");
        dayDiv.appendChild(windDiv);

        forecastSection.appendChild(dayDiv);
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