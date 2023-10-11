const cityCountry = document.querySelector(".city-country");

const searchBar = document.getElementById("city");
searchBar.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        const cityName = searchBar.value;
        const processedData = getData(cityName);
        console.log(processedData);
    }
});

async function getData(cityName) {
    const response = await fetch('https://api.weatherapi.com/v1/current.json?key=cd0065695f244f8783a190858232909&q=' + cityName, {mode: 'cors'});
    const weatherData = await response.json();
    return processData(weatherData);
}

function processData(data) {
    const city = data.location.name;
    const country = data.location.country;
    return { city, country };
}