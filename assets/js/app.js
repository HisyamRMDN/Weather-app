"use strict";

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

const addEventOnElements = function (elements, eventType, callback) {
    // @params {Nodelist} elements - NodeList of elements
    // @params {string} eventType - Event type
    // @params {function} callback - Callback function
    for (const element of elements) element.addEventListener(eventType, callback);
};

let tempChartInstance = null;

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

/* ====================================================
   MESIN CANVAS EFEK CUACA (TANPA UBAH BACKGROUND)
   ==================================================== */
const canvas = document.getElementById("weather-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let weatherAnimationId = null;

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ====================================================
   MESIN CANVAS EFEK CUACA (VERSI LENGKAP)
   ==================================================== */
const renderWeatherEffects = (type) => {
    if (weatherAnimationId) cancelAnimationFrame(weatherAnimationId);
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (type === "clear") return; // Layar bersih jika tidak ada efek

    // 1. Tentukan jumlah partikel berdasarkan cuaca
    let particleCount = 0;
    if (type === "rain") particleCount = 80;
    else if (type === "snow") particleCount = 40;
    else if (type === "clouds")
        particleCount = 8; // Awan raksasa cukup sedikit
    else if (type === "sunny") particleCount = 35; // Debu cahaya menyebar

    // 2. Bentuk karakteristik fisik setiap partikel
    for (let i = 0; i < particleCount; i++) {
        let p = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            opacity: Math.random() * 0.4 + 0.1,
        };

        if (type === "rain") {
            p.speedY = Math.random() * 5 + 8;
            p.speedX = -0.5;
            p.size = Math.random() * 20 + 20;
        } else if (type === "snow") {
            p.speedY = Math.random() * 2 + 1;
            p.speedX = (Math.random() - 0.5) * 1.5;
            p.size = Math.random() * 4 + 2;
        } else if (type === "clouds") {
            p.speedY = 0; // Awan tidak jatuh
            p.speedX = Math.random() * 0.5 + 0.1; // Mengambang lambat ke kanan
            p.size = Math.random() * 200 + 100; // Ukuran Raksasa (Radius 100-300px)
            p.opacity = Math.random() * 0.03 + 0.01; // Sangat transparan/halus
        } else if (type === "sunny") {
            p.speedY = (Math.random() - 0.5) * 0.5; // Mengambang bebas ke segala arah
            p.speedX = (Math.random() - 0.5) * 0.5;
            p.size = Math.random() * 3 + 1; // Bulatan debu cahaya kecil
        }
        particles.push(p);
    }

    // 3. Mesin Loop Animasi
    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            ctx.beginPath();

            // Pewarnaan Partikel
            if (type === "rain") {
                ctx.fillStyle = `rgba(135, 206, 250, ${p.opacity})`;
                ctx.rect(p.x, p.y, 2.5, p.size);
            } else if (type === "sunny") {
                ctx.fillStyle = `rgba(255, 223, 0, ${p.opacity})`; // Warna Emas/Kuning Cahaya
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`; // Putih (Salju & Awan)
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            }

            ctx.fill();

            // Pergerakan
            p.y += p.speedY;
            p.x += p.speedX;

            // Logika "Ulangi" saat melewati batas layar
            if (type === "clouds") {
                if (p.x - p.size > canvas.width) p.x = -p.size; // Masuk lagi dari kiri
            } else if (type === "sunny") {
                // Debu cahaya memantul/tembus dari semua sisi
                if (p.y > canvas.height) p.y = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;
            } else {
                // Hujan & Salju kembali ke atas
                if (p.y > canvas.height) {
                    p.y = -25;
                    p.x = Math.random() * canvas.width;
                }
            }
        });

        weatherAnimationId = requestAnimationFrame(draw);
    };

    draw();
};

// Fungsi Trigger Logika Cuaca
const triggerWeatherEffects = function (icon) {
    let effectType = "clear";

    if (icon === "01d" || icon === "01n") {
        effectType = "sunny"; // Cerah (Siang/Malam)
    } else if (icon.includes("02") || icon.includes("03") || icon.includes("04")) {
        effectType = "clouds"; // Semua jenis berawan/mendung
    } else if (icon.includes("09") || icon.includes("10") || icon.includes("11")) {
        effectType = "rain"; // Hujan & Badai
    } else if (icon.includes("13")) {
        effectType = "snow"; // Salju
    }

    renderWeatherEffects(effectType);
};

const renderTempChart = (hourlyList) => {
    const ctx = document.getElementById("tempChart")?.getContext("2d");
    if (!ctx) return;

    const next24Hours = hourlyList.slice(0, 8);
    const labels = next24Hours.map((item) => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    });
    const temps = next24Hours.map((item) => Math.round(item.main.temp));

    if (tempChartInstance) {
        tempChartInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, "rgba(17, 95, 212, 0.4)");
    gradient.addColorStop(1, "rgba(17, 95, 212, 0)");

    tempChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Suhu (°C)",
                    data: temps,
                    borderColor: "#152cb3",
                    borderWidth: 3,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#152cb3",
                    pointRadius: 4,
                    fill: true,
                    backgroundColor: gradient,
                    tension: 0.4, // Garis melengkung halus (smooth curve)
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#a0a0a0" },
                },
                y: {
                    grid: { color: "rgba(255, 255, 255, 0.05)" },
                    ticks: { color: "#a0a0a0" },
                },
            },
        },
    });
};

// 📍 TARUH DEKLARASI FUNGSI INI DI LUAR updateWeather
const updateAdvice = (currentWeather) => {
    const activityEl = document.querySelector("[data-advice-activity]");
    const outfitEl = document.querySelector("[data-advice-outfit]");
    const healthEl = document.querySelector("[data-advice-health]");

    if (!activityEl || !outfitEl || !healthEl) return;

    const { temp } = currentWeather.main;
    const weatherMain = currentWeather.weather[0].main.toLowerCase();

    if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
        activityEl.innerText = "Utamakan Aktivitas Indoor";
        outfitEl.innerText = "Bawa Payung & Jas Hujan";
        healthEl.innerText = "Hati-hati Jalan Licin";
    } else if (temp >= 32) {
        activityEl.innerText = "Gunakan Sunscreen Saat Keluar";
        outfitEl.innerText = "Pakaian Tipis & Baju Cerah";
        healthEl.innerText = "Perbanyak Minum Air Putih";
    } else if (temp <= 20) {
        activityEl.innerText = "Cukup Nyaman Buat Jalan Santai";
        outfitEl.innerText = "Gunakan Jaket / Sweater";
        healthEl.innerText = "Jaga Suhu Tubuh Tetap Hangat";
    } else {
        activityEl.innerText = "Sangat Cocok Olahraga Outdoor";
        outfitEl.innerText = "Pakaian Kasual Nyaman";
        healthEl.innerText = "Kondisi Udara & Suhu Ideal";
    }
};

// @params {string} lat - latitude
// @params {string} lon - longitude
export const updateWeather = function (lat, lon) {
    loading.style.display = "grid";

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
        errorContent.style.display = "none";
        loading.style.display = "grid";
        container.style.overflowY = "hidden";
        const {
            weather,
            dt: dateUnix,
            sys: { sunrise: sunriseUnix, sunset: sunsetUnix },
            main: { temp, feels_like, pressure, humidity },
            visibility,
            timezone,
        } = currentWeather;
        const [{ description, icon }] = weather;
        console.log("Ikon cuaca terdeteksi:", icon);

        triggerWeatherEffects(icon);
        console.log("Fungsi trigger efek sudah dilewati!");

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
        fetchData(
            url.reverseGeo(lat, lon),
            function ([{ name, country }]) {
                card.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
            },
            function (err) {
                console.error(err);
                loading.style.display = "none";
                error404();
            },
        );

        updateAdvice(currentWeather);

        // TODAY'S HIGHLIGHTS
        fetchData(
            url.airPollution(lat, lon),
            function (airPollution) {
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
            },
            function (err) {
                console.error(err);
                loading.style.display = "none";
                error404();
            },
        );

        // 24 HOURLY FORECAST
        fetchData(
            url.forecast(lat, lon),
            function (forecast) {
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
                    tempLi.className = "slider-item animate-card";
                    tempLi.innerHTML = `
                <div class="card card-sm slider-card">
                    <p class="body-3">${module.getTime(dateUnix, timezone)}</p>
                    <img src="./assets/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}" class="weather-icon" title="${description}" />
                    <p class="body-3">${parseInt(temp)}&deg<sup>c</sup></p>
                </div>
                `;
                    hourlyForecastSection.querySelector("[data-temp]").appendChild(tempLi);
                    const windLi = document.createElement("li");
                    windLi.className = "slider-item animate-card";
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
                <ul data-forecast-list>
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
                    li.className = "card-item animate-card";
                    li.innerHTML = `
                <div class="icon-wrapper">
                    <img src="./assets/images/weather_icons/${icon}.png" width="36" height="36" alt="${description}" class="weather-icon" title="${description}" />
                    <span class="span">
                        <p class="title-2">${parseInt(temp_max)}&deg;<sup>c</sup></p>
                    </span>
                    </div>
                <p class="label-1">${date.getDate()} ${module.monthNames[date.getMonth()]}</p>
                <p class="label-1">${module.weekDayNames[date.getDay()]}</p>
                `;
                    forecastSection.querySelector("[data-forecast-list]").appendChild(li);
                    renderTempChart(forecast.list);
                }

                currentWeatherSection.appendChild(card);
                loading.style.display = "none";
                container.style.overflowY = "overlay";
            },
            function (err) {
                console.error(err);
                loading.style.display = "none";
                error404();
            },
        );
    });
};

export const error404 = () => {
    container.style.display = "none";
    errorContent.style.display = "flex";
};
