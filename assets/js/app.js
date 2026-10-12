"use strict";

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

const addEventOnElements = function (elements, eventType, callback) {
    // @params {Nodelist} elements - NodeList of elements
    // @params {string} eventType - Event type
    // @params {function} callback - Callback function
    for (const element of elements) element.addEventListener(eventType, callback);
};

const searchView = document.querySelector("[data-search-view]");

const searchTogglers = document.querySelectorAll("[data-search-togglers]");
const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchTogglers, "click", toggleSearch);
console.log(searchTogglers);

// SEARCH INTEGRATION
const searchField = document.querySelector("[data-search-field]"); // search field
const searchResult = document.querySelector("[data-search-result]"); // search result

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function () {
    searchTimeout && clearTimeout(searchTimeout);

    if (!searchField.value) {
        searchResult.classList.remove("active");
        searchResult.innerHTML = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.innerHTML = ` <ul class="view-list" data-search-list></ul> `;
                const items = [];
                for (const { name, lat, lon, country, state } of locations) {
                    const searchItem = document.createElement("li");
                    searchItem.classList.add("view-item");
                    searchItem.innerHTML = `
                        <span class="m-icon">location_on</span>

                        <div>
                            <p class="item-title">${name}</p>
                            <p class="label-2 item-subtitle">${state || ""} ${country}</p>
                        </div>

                        <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-togglers></a>
                    `;
                    searchResult.querySelector("[data-search-list]").appendChild(searchItem);
                    items.push(searchItem.querySelector("[data-search-togglers]"));
                }
                addEventOnElements(items, "click", function () {
                    toggleSearch();
                    searchResult.classList.remove("active");
                });
            });
        }, searchTimeoutDuration);
    }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");

// @params {string} lat - latitude
// @params {string} lon - longitude
export const updateWeather = function (lat, lon) {
    // loading.style.display = "grid";
    container.style.overflowY = "hidden";
    // container.classList.remove("fade-in");
    errorContent.style.display = "none";

    const currentWeatherSection = document.querySelector("[data-current-weather]");
    const highlightSection = document.querySelector("[data-highlights]");
    const hourlyForecastSection = document.querySelector("[data-hourly-forecast]");
    const forecastSection = document.querySelector("[data-5-day-forecast]");

    currentWeatherSection.innerHTML = "";
    highlightSection.innerHTML = "";
    hourlyForecastSection.innerHTML = "";
    forecastSection.innerHTML = "";

    if (window.location.hash === "#/current-location") {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled");
    }

    // CURRENT WEATHER SECTION
    fetchData(url.currentWeather(lat, lon), function (currentWeather) {
        const {
            weather,
            dt: dateUnix,
            sys: { sunrise: sunriseUnix, sunset: sunsetUnix },
            main: { temp, feels_like, pressure, humidity },
            visibility,
            timezone,
        } = currentWeather;
        const [{ description, icon }] = weather;

        const card = document.createElement("div");
        card.classList.add("card", "card-lg", "current-weather-card");
        card.innerHTML = `
            <h2 class="title-2 card-title">NOW</h2>
            <div class="wrapper">
                <p class="heading">${parseInt(temp)}&deg<sup>c</sup></p>
                <img src="./assets/images/weather_icons/${icon}.png" width="64" height="64" alt="${description}" class="weather-icon" title="" />
            </div>
            <p class="body-3">${description}</p>
            <ul class="meta-list">
                <li class="meta-item">
                    <span class="m-icon">Calendar_today</span>
                    <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
                </li>
                <li class="meta-item">
                    <span class="m-icon">Location_on</span>
                    <p class="title-3 meta-text" data-location></p>
                </li>
            </ul>
            `;
        fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
            card.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
        });
        currentWeatherSection.appendChild(card);

        // TODAY'S HIGHLIGHTS
        fetchData(url.airPollution(lat, lon), function (airPollution) {
            const [
                {
                    main: { aqi },
                    components: { no2, o3, so2, pm2_5 },
                },
            ] = airPollution.list;
            const card = document.createElement("div");
            card.classList.add("card", "card-lg");
            card.innerHTML = `
            <h2 class="title-2" id="highlights-label">Todays Highlights</h2>
                            <div class="highlights-list">
                                <div class="card card-sm highlights-card one">
                                    <h3 class="title-3">Air Quality Index</h3>
                                    <div class="wrapper">
                                        <span class="m-icon">air</span>
                                        <ul class="card-list">
                                            <li class="card-item">
                                                <p class="title-1">${Number(pm2_5).toPrecision(3)}</p>
                                                <p class="label-1">PM <sub></sub></p>
                                            </li>
                                            <li class="card-item">
                                                <p class="title-1">${Number(so2).toPrecision(3)}</p>
                                                <p class="label-1">SO<sub>2</sub></p>
                                            </li>
                                            <li class="card-item">
                                                <p class="title-1">${Number(no2).toPrecision(3)}</p>
                                                <p class="label-1">NO<sub>2</sub></p>
                                            </li>
                                            <li class="card-item">
                                                <p class="title-1">${Number(o3).toPrecision(3)}</p>
                                                <p class="label-1">O<sub>3</sub></p>
                                            </li>
                                        </ul>
                                    </div>
                                    <span class="badge aqi-${aqi} label-${aqi}" title="${module.aqiText[aqi].message}">${module.aqiText[aqi].level}</span>
                                </div>

                                <div class="card card-sm highlights-card two">
                                    <h3 class="title-3">Sunrise & Sunset</h3>
                                    <div class="card-list">
                                        <div class="card-item">
                                            <span class="m-icon">clear_day</span>
                                            <div>
                                                <p class="label-1">Sunrise</p>
                                                <p class="title-1">${module.getTime(sunriseUnix, timezone)}</p>
                                            </div>
                                        </div>
                                        <div class="card-item">
                                            <span class="m-icon">clear_night</span>
                                            <div>
                                                <p class="label-1">Sunset</p>
                                                <p class="title-1">${module.getTime(sunsetUnix, timezone)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="card card-sm highlights-card">
                                    <h3 class="title-3">Humidity</h3>
                                    <div class="wrapper">
                                        <span class="m-icon">humidity_percentage</span>
                                        <p class="title-1">${humidity}<sub>%</sub></p>
                                    </div>
                                </div>
                                <div class="card card-sm highlights-card">
                                    <h3 class="title-3">Pressure</h3>
                                    <div class="wrapper">
                                        <span class="m-icon">airwave</span>
                                        <p class="title-1">${pressure}<sub>hPa</sub></p>
                                    </div>
                                </div>
                                <div class="card card-sm highlights-card">
                                    <h3 class="title-3">Visibility</h3>
                                    <div class="wrapper">
                                        <span class="m-icon">visibility</span>
                                        <p class="title-1">${visibility / 1000}<sub>Km</sub></p>
                                    </div>
                                </div>
                                <div class="card card-sm highlights-card">
                                    <h3 class="title-3">Feels Like</h3>
                                    <div class="wrapper">
                                        <span class="m-icon">Thermostat</span>
                                        <p class="title-1">${parseInt(feels_like)}&deg<sup>c</sup></p>
                                    </div>
                                </div>
                            </div>
            `;
            highlightSection.appendChild(card);
        });

        // 24 HOURLY FORECAST
        fetchData(url.forecast(lat, lon), function (forecast) {
            console.log("Data API Forecast:", forecast);
            const {
                list: forecastList,
                city: { timezone },
            } = forecast;
            hourlyForecastSection.innerHTML = `
            <h2 class="title-2">Today At</h2>
                        <div class="slider-container">
                            <ul class="slider-list" data-temp>
                            </ul>
                            <ul class="slider-list" data-wind>
                            </ul>
                        </div>
            `;
            for (const [index, data] of forecastList.entries()) {
                if (index > 7) break;
                const {
                    dt: dateUnix,
                    main: { temp },
                    weather,
                    wind: { deg: windDirection, speed: windSpeed },
                } = data;
                const [{ description, icon }] = weather;
                const tempLi = document.createElement("li");
                tempLi.classList.add("slider-item");
                tempLi.innerHTML = `
                <div class="card card-sm slider-card">
                    <p class="body-3">${module.getTime(dateUnix, timezone)}</p>
                    <img src="./assets/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}" class="weather-icon" title="${description}" />
                    <p class="body-3">${parseInt(temp)}&deg<sup>c</sup></p>
                </div>
                `;
                hourlyForecastSection.querySelector("[data-temp]").appendChild(tempLi);
                const windLi = document.createElement("li");
                windLi.classList.add("slider-item");
                windLi.innerHTML = `
                <div class="card card-sm slider-card">
                    <p class="body-3">${module.getTime(dateUnix, timezone)}</p>
                    <img src="./assets/images/weather_icons/direction.png" width="48" height="48" loading="lazy" alt="Direction" class="weather-icon" style="transform: rotate(${windDirection - 180}deg)" title="Wind direction" />
                    <p class="body-3">${parseInt(module.mps_to_kph(windSpeed))}km/h</p>
                </div>
                `;
                hourlyForecastSection.querySelector("[data-wind]").appendChild(windLi);
            }
            // 5 DAY FORECAST
            forecastSection.innerHTML = `
            <h2 class="title-2">5 DAYS FORECAST</h2>
            <div class="card card-lg forecast-card">
                <ul>
                    <li class="card-item">
                        <div class="icon-wrapper">
                            <img src="./assets/images/weather_icons/01n.png" width="36" height="36" alt="Overcast Clouds" class="weather-icon" />
                            <span class="span">
                                <p class="title-2">25&deg;<sup>c</sup></p>
                            </span>
                        </div>

                        <p class="label-1">17 Feb</p>
                        <p class="label-1">Friday</p>
                    </li>
                </ul>
            </div>
            `;
            for (let i = 7, len = forecastList.length; i < len; i += 8) {
                const {
                    main: { temp_max },
                    weather,
                    dt_txt,
                } = forecastList[i];
                const [{ description, icon }] = weather;
                const date = new Date(dt_txt);

                const li = document.createElement("li");
                li.classList.add("card-item");
                li.innerHTML = `
                <div class="icon-wrapper">
                    <img src="./assets/images/weather_icons/${icon}.png" width="36" height="36" alt="${description}" class="weather-icon" />
                    <span class="span">
                        <p class="title-2">${parseInt(temp_max)}&deg;<sup>c</sup></p>
                    </span>
                </div>
`;
            }
        });
    });
};

export const error404 = function () {};
