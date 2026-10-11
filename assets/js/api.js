"use strict";

const api_key = "b761155b04c82611c993a8295fbad551";

// Fetch data from API
// @param {string} URL - API URL
// @param {function} callback - Callback function
export const fetchData = function (URL, callback) {
    fetch(`${URL}&appid=${api_key}`)
        .then((res) => res.json())
        .then((data) => callback(data));
};

export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`;
    },
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`;
    },
    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
    },
    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${api_key}`;
    },
    // weather(lat, lon) {
    // @param {string} query Search query e.g. London
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api_key}`;
    },
};
