"use strict";

/**
 * Fetch data from API
 * @param {string} URL - API URL
 * @param {function} callback - Callback function
 */
export const fetchData = function (URL, callback, errorCallback) {
    fetch(`/api/weather?url=${encodeURIComponent(URL)}`)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then((data) => callback(data))
        .catch((err) => {
            console.error(err);
            // Menjalankan fungsi error kustom jika disediakan
            if (errorCallback) errorCallback(err);
        });
};

export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`;
    },
    forecast(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`;
    },
    airPollution(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`;
    },
    reverseGeo(lat, lon) {
        return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`;
    },
    geo(query) {
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
    },
};
