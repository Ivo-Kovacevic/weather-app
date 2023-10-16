getData("Zagreb").then(processedWeatherData => {
    generateDOM(processedWeatherData);
    populateStaticData(processedWeatherData);
});

const searchBar = document.getElementById("enter");
searchBar.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        const cityName = searchBar.value;
        getData(cityName).then(processedWeatherData => {
            generateDOM(processedWeatherData);
            populateStaticData(processedWeatherData);
        });
        searchBar.value = '';
    }
});

async function getData(cityName) {
    const response = await fetch('https://api.weatherapi.com/v1/forecast.json?key=cd0065695f244f8783a190858232909&q=' + cityName + '&days=3', {mode: 'cors'});
    const weatherData = await response.json();
    return processData(weatherData);
}

function processData(data) {

    // Current weather
    const currentData = new City(
        data.location.name,
        data.location.country,
        data.location.localtime,
        data.current.is_day,
        data.current.condition.code,
        data.current.condition.text,
        data.current.temp_c,
        data.current.feelslike_c,
        data.current.wind_kph,
        data.current.humidity,
        data.current.uv,
        data.forecast.forecastday[0].astro.sunrise,
        data.forecast.forecastday[0].astro.sunset
    );

    // Today forecast
    const currentTime = parseInt(currentData.time.split(' ')[1].split(':')[0]);
    let forecastHours = [];
    forecastHours = getHours(forecastHours, currentTime, data.forecast.forecastday[0]);
    let newTime = parseInt(forecastHours[forecastHours.length - 1].time.split(' ')[1].split(':')[0]);
    if (forecastHours.length < 6) {
        if (newTime === 21) {
            newTime = 0;
        } else if (newTime === 22) {
            newTime = 1;
        } else {
            newTime = 2;
        }
        forecastHours = getHours(forecastHours, newTime, data.forecast.forecastday[1]);
    }

    // Week forecast
    const forecastDays = [];
    data.forecast.forecastday.forEach((forecastday) => {
        const day  = new Day(
            forecastday.date,
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
        forecastHours: forecastHours,
    };
}

class City {
    constructor(city, country, time, isDay, code, condition, temperature, feelsLike, wind, humidity, uv, sunrise, sunset) {
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
        this.sunrise = sunrise;
        this.sunset = sunset;
    }
}

class Hour {
    constructor(time, code, isDay, temp) {
        this.time = time;
        this.code = code;
        this.isDay = isDay;
        this.temp = temp;
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

function getHours(forecastHours, currentTime, day) {

    const hoursToIterate = day.hour.slice(currentTime);

    hoursToIterate.forEach((hour, index) => {
        if (index % 3 === 0 || index === 0) {
            const newHour = new Hour(
                hour.time,
                hour.condition.code,
                hour.is_day,
                hour.temp_c
            );
            if (forecastHours.length < 6) {
                forecastHours.push(newHour);
            }
        }
    });
    return forecastHours;
}

function populateStaticData(data) {

    // Populate header
    const city = document.querySelector(".city");
    const country = document.querySelector(".country");
    const time = document.querySelector(".time");
    const temperature = document.querySelector(".temperature");
    const feelsLike = document.querySelector(".feelsLike");
    const image = document.getElementById("currentWeather");
    const sunrise = document.querySelector(".sunrise");
    const sunset = document.querySelector(".sunset");

    city.textContent = data.currentData.city;
    country.textContent = data.currentData.country;
    time.textContent = data.currentData.time;
    temperature.textContent = data.currentData.temperature + "°";
    feelsLike.textContent = "Feels like " + data.currentData.feelsLike + "°";

    const date = new Date();

    sunrise.textContent = data.currentData.sunrise;
    sunset.textContent = data.currentData.sunset;


    // Populate today's conditions
    const wind = document.querySelector(".wind");
    const humidity = document.querySelector(".humidity");
    const uv = document.querySelector(".uv");

    wind.textContent = data.currentData.wind + " km/h";
    humidity.textContent = data.currentData.humidity + "%";
    uv.textContent = data.currentData.uv;


    checkWeather(data.currentData, image, data.currentData.isDay);
}

function generateDOM(data) {

    console.log(data);

    generateTodayForecast(data);
    generateWeekForecast(data);

}

function generateTodayForecast(data) {

    const section = document.querySelector(".hour-forecast");
    section.innerHTML = '';

    data.forecastHours.forEach(hour => {

        const divDay = document.createElement("div");
        divDay.classList.add("hour");

        const dayName = document.createElement("h3");
        const image = document.createElement("img");
        const minMaxTemp = document.createElement("h3");
        
        dayName.textContent = hour.time.split(' ')[1];
        checkWeather(hour, image, hour.isDay);
        minMaxTemp.textContent = hour.temp;

        divDay.appendChild(dayName);
        divDay.appendChild(image);
        divDay.appendChild(minMaxTemp);

        section.appendChild(divDay);
    });
}

function generateWeekForecast(data) {

    const section = document.querySelector(".day-forecast");
    section.innerHTML = '';

    const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    data.forecastDays.forEach((day, index) => {

        const divDay = document.createElement("div");
        divDay.classList.add("day");

        const d = new Date(day.date);
        let nameOfDay = d.getDay();

        const dayName = document.createElement("h3");
        const image = document.createElement("img");
        const minMaxTemp = document.createElement("h3");
        
        if (index === 0) {
            dayName.textContent = "Today";
        } else {
            dayName.textContent = weekday[nameOfDay];
        }
        checkWeather(day, image);
        minMaxTemp.textContent = day.maxtemp_c + "°/" + day.mintemp_c + "°";

        divDay.appendChild(dayName);
        divDay.appendChild(image);
        divDay.appendChild(minMaxTemp);

        section.appendChild(divDay);
    });
}

function checkWeather(day, image, dayNight) {

    if (dayNight === 0) {
        dayNight = "night";
    } else {
        dayNight = "day";
    }

    const background = document.querySelector("body");
    
    if (day.code === 1000) {
        image.src = "images/" + dayNight + "-clear.png";
    } else if (day.code >= 1003 && day.code <= 1009) {
        image.src = "images/" + dayNight + "-cloudy.png";
    } else if (day.code === 1030 || day.code === 1135 || day.code === 1147) {
        image.src = "images/" + dayNight + "-mist.png";
    } else if (day.code === 1063 
            || day.code === 1072 
            || (day.code >= 1150 && day.code <= 1183)
            || day.code === 1198
            || day.code === 1240) {
        image.src = "images/" + dayNight + "-light-rain.png";
    } else if ((day.code >= 1186 && day.code <= 1195)
            || day.code === 1201
            || day.code === 1207
            || (day.code >= 1243 && day.code <= 1246)) {
        image.src = "images/" + dayNight + "-rain.png";
    } else if (day.code >= 1066 && day.code <= 1069
            || day.code >= 1114 && day.code <= 1117
            || day.code >= 1204 && day.code <= 1237
            || day.code >= 1249 && day.code <= 1264) {
        image.src = "images/" + dayNight + "-snow.png"
    } else if (day.code >= 1273 && day.code <= 1282
            || day.code === 1087) {
        image.src = "images/" + dayNight + "-storm.png"
    }

    if (day.isDay === 0 || day.code >= 1006 && day.code <= 1282) {
        background.style.backgroundImage = "linear-gradient(to bottom left, #615F8E, #53568D)";
    } else {
        background.style.backgroundImage = "linear-gradient(to bottom left, #84B9FC, #74B1F0)";
    }
}