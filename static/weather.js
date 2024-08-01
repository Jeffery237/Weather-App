let weatherInfo = null;
let cityInput = document.getElementById('city-name');
let searchBtn = document.getElementById('search-btn');
let locationButton = document.querySelector(".location-button");
let param = "yaounde";

search(param);

function formatDate(date){
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                         'September', 'October', 'November', 'December'];

    let dayOfWeek = daysOfWeek[date.getDay()];
    let month = monthsOfYear[date.getMonth()];
    let dayOfMonth = date.getDate();
    let year = date.getFullYear();

    return `${dayOfWeek}, ${month} ${dayOfMonth} ${year}`;
}
function getUserLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
        console.log("Geolocation is not supported by this browser.");
    }
    
    function showPosition(position) {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        fetch(`https://api.weatherapi.com/v1/forecast.json?key=9ee7f1cbbe9f417187b74417242707&q=${latitude},${longitude}&days=5`, {
            method: "GET"
        }) 
        .then(async (response) => {
            if (response.ok) {
                let data = await response.json();
                weatherInfo = data;
                console.log("Response Status: ", response.status);
                currentPositionInfo();
            } else {
                console.log("Request failed with status: ", response.status);
                let errorData = await response.json();
                console.log("Error details: ", errorData);
            }
        })
        .catch((error) => {
            console.error("Error Message: ", error.message);
        });
    }
    
    function showError(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
        }
    }
}

function currentPositionInfo(){
    let date = document.getElementById("date");
    let cityName = document.getElementById("city");
    let apiDate = formatDate(new Date(weatherInfo.location.localtime));
    let apiTime = new Date(weatherInfo.location.localtime); 
    apiTime = apiTime.toLocaleTimeString();
    cityName.textContent = weatherInfo.location.name;
    date.textContent = `${apiDate} | ${apiTime}`;
    updateUI();
    displayForecastData();
    toggleNightMode();
}

function updateDate(){
    let searchQuery = cityInput.value;
    searchQuery = searchQuery.toLowerCase();
    let date = document.getElementById("date");
    let cityName = document.getElementById("city");
    
    if(weatherInfo.location.name.toLowerCase().includes(searchQuery) || 
        weatherInfo.location.country.toLowerCase().includes(searchQuery) ||
        weatherInfo.location.region.toLowerCase().includes(searchQuery)){
        let apiDate = formatDate(new Date(weatherInfo.location.localtime));
        let apiTime = new Date(weatherInfo.location.localtime); 
        apiTime = apiTime.toLocaleTimeString();
        cityName.textContent = `${weatherInfo.location.name} , ${weatherInfo.location.country}`;
        date.textContent = `${apiDate} | ${apiTime}`;
        updateUI();
        displayForecastData();
    }else{
        console.log("City not found!!!")
    }
    cityInput.value = '';
}

function search(city){
    if (!city) {
        console.error("City name is required.");
        return;
    }
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=9ee7f1cbbe9f417187b74417242707&q=${city}&days=5`, {
        method: "GET"
    }) 
    .then(async (response) => {
        if (response.ok) {
            console.log('Response status: ', response.status)
            let data = await response.json();
            weatherInfo = data;
            updateDate();
            toggleNightMode();
        } else {
            console.log("Request failed with status: ", response.status);
            let errorData = await response.json();
            console.log("Error details: ", errorData);
        }
    })
    .catch((error) => {
        console.error("Error Message: ", error.message);
    });
}

function displayForecastData() {
    let forecastContainer = document.querySelector(".days-container");
    forecastContainer.innerHTML = "";

    if (weatherInfo.forecast.forecastday.length > 0) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < weatherInfo.forecast.forecastday.length; i++) {
            const forecastItem = document.createElement("div");
            forecastItem.classList.add("days");

            let fday = new Date(weatherInfo.forecast.forecastday[i].date);
            let dayName = daysOfWeek[fday.getDay()];

            forecastItem.innerHTML = `
                <p class="day">${dayName}</p>
                <img src="https:${weatherInfo.forecast.forecastday[i].day.condition.icon}" alt="" class="dayImg">
                <p class="day-forecast-temp">${Math.round(weatherInfo.forecast.forecastday[i].day.maxtemp_c)}° - ${Math.round(weatherInfo.forecast.forecastday[i].day.mintemp_c)}°</p>
                <p class="day-weather-condition">${weatherInfo.forecast.forecastday[i].day.condition.text}</p>
            `;

            forecastContainer.appendChild(forecastItem);
        }
    }
}


function updateUI(){
    let temperature = document.getElementById("degree-celcius");
    let celcius = document.getElementById("deg-celcius");
    let fahrenheit = document.getElementById("fahrenheit");
    let feelsLike = document.getElementById("feels-like");
    let humidity = document.getElementById("humidity");
    let windSpeed = document.getElementById("wind");
    let weatherState = document.getElementById("weather-state");
    let weatherImage = document.getElementById("weather-image");

    /*Update UI Data*/
    temperature.textContent = Math.round(weatherInfo.current.temp_c);
    weatherState.textContent = weatherInfo.current.condition.text;
    let feels = Math.round(`${weatherInfo.current.feelslike_c}`);
    feelsLike.textContent = `Feels like: ${feels}°C`
    humidity.textContent = `Humidity: ${weatherInfo.current.humidity}%`;
    let wind = Math.round(`${weatherInfo.current.wind_mph}` * 1.60934);
    windSpeed.textContent = `Wind: ${wind}km/h`;
    weatherImage.src = `https:${weatherInfo.current.condition.icon}`;
    weatherImage.style = "width: 180px; height: 140px"

    celcius.addEventListener("click", () =>{
        temperature.textContent = Math.round(weatherInfo.current.temp_c);
        celcius.style = "color: white; font-weight: bold; cursor: pointer";
        fahrenheit.style = "color: grey; font-weight: bold; cursor: pointer";
    });
    fahrenheit.addEventListener("click", () =>{
        temperature.textContent = Math.round(weatherInfo.current.temp_f);
        fahrenheit.style = "color: white; font-weight: bold; cursor: pointer";
        celcius.style = "color: grey; font-weight: bold; cursor: pointer";
    })

}

function toggleNightMode(){
    let date = new Date(weatherInfo.location.localtime);
    let hours = date.getHours();
    let mainContainer = document.querySelector(".main-container");
    let inputDivClass = document.querySelector(".search");
    let inputField = document.querySelector(".city-name");
    let searchButton = document.querySelector(".search-btn");
    let locationButton = document.querySelector(".location-button");
    let locationIcon = document.querySelector("#location-icon");
    let forecastSection = document.querySelector(".days-container");

    if((hours >=19) || (hours < 6)){
        mainContainer.classList.add("nightmode");
        mainContainer.style = `background: url("./img/background-night.png") no-repeat center center/cover`;
        inputDivClass.classList.add("nightmode");
        inputDivClass.style = "background: var(--secondaryBackground)";
        inputField.classList.add("nightmode");
        inputField.style = "background: var(--secondaryBackground); color: var(--text)";
        searchButton.classList.add("nightmode");
        searchButton.style = "background: var(--text); color: #171c48";
        locationButton.classList.add("nightmode");
        locationButton.style = "background: var(--text)";
        locationIcon.setAttribute("src", `./img/location-black.png`);
        forecastSection.classList.add("nightmode");
        forecastSection.style = "background: var(--secondaryBackground)";
    }else{
        mainContainer.classList.remove("nightmode");
        mainContainer.style = `background: url("./img/background-day.png") no-repeat center center/cover`;
        inputDivClass.classList.remove("nightmode");
        inputDivClass.style = "background: var(--text)";
        inputField.classList.remove("nightmode");
        inputField.style = "background: var(--text); color: var(--input-text)";
        searchButton.classList.remove("nightmode");
        searchButton.style = "background: var(--blue-search-bg); color: var(--text)";
        locationButton.classList.remove("nightmode");
        locationButton.style = "background: var(--blue-search-bg)";
        locationIcon.setAttribute("src", `./img/location-white.png`);
        forecastSection.classList.remove("nightmode");
        forecastSection.style = "background: var(--forecast-day-bg)";
    }
}



searchBtn.addEventListener("click", function(e){
    e.preventDefault();
    let city = cityInput.value;
    search(city);
});
locationButton.addEventListener("click", getUserLocation);