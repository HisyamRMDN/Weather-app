"use strict";

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

// ---------------------------------------------------------------------------
// DOM Helper: membangun elemen secara eksklusif dengan DOM API standar
// (document.createElement, textContent, classList.add, setAttribute, append).
// Tidak ada innerHTML / penyisipan string HTML mentah di seluruh file ini.
// ---------------------------------------------------------------------------

const $ = (tag, options = {}) => {
    const { text, class: className, attrs = {}, children = [] } = options;
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.classList.add(...String(className).split(/\s+/));
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value);
    }
    for (const child of children) el.append(child);
    return el;
};

// Teks dengan elemen <sup> (contoh: "25\u00B0c")
const withSup = (text, supText) => {
    const span = document.createElement("span");
    span.textContent = text;
    const sup = document.createElement("sup");
    sup.textContent = supText;
    span.append(sup);
    return span;
};

// Teks dengan elemen <sub> (contoh: "60%")
const withSub = (text, subText) => {
    const span = document.createElement("span");
    span.textContent = text;
    const sub = document.createElement("sub");
    sub.textContent = subText;
    span.append(sub);
    return span;
};

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
        searchResult.textContent = "";
        searchField.classList.remove("searching");
    } else {
        searchField.classList.add("searching");
    }

    if (searchField.value) {
        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("searching");
                searchResult.classList.add("active");
                searchResult.textContent = "";

                const searchList = $("ul", {
                    class: "view-list",
                    attrs: { "data-search-list": "" },
                });
                searchResult.append(searchList);

                const items = [];
                for (const { name, lat, lon, country, state } of locations) {
                    const searchItem = $("li", { class: "view-item" });
                    const icon = $("span", { class: "m-icon", text: "location_on" });

                    const infoDiv = $("div");
                    const title = $("p", { class: "item-title", text: name });
                    const subtitle = $("p", {
                        class: "label-2 item-subtitle",
                        text: `${state || ""} ${country}`,
                    });
                    infoDiv.append(title, subtitle);

                    const link = $("a", {
                        class: "item-link has-state",
                        attrs: {
                            href: `#/weather?lat=${lat}&lon=${lon}`,
                            "aria-label": `${name} weather`,
                            "data-search-togglers": "",
                        },
                    });

                    searchItem.append(icon, infoDiv, link);
                    searchList.append(searchItem);
                    items.push(link);
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
                    label: "Suhu (\u00B0C)",
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

// ?? TARUH DEKLARASI FUNGSI INI DI LUAR updateWeather
const updateAdvice = (currentWeather) => {
    const activityEl = document.querySelector("[data-advice-activity]");
    const outfitEl = document.querySelector("[data-advice-outfit]");
    const healthEl = document.querySelector("[data-advice-health]");

    if (!activityEl || !outfitEl || !healthEl) return;

    const { temp } = currentWeather.main;
    const weatherMain = currentWeather.weather[0].main.toLowerCase();

    if (weatherMain.includes("rain") || weatherMain.includes("drizzle") || weatherMain.includes("thunderstorm")) {
        activityEl.textContent = "Utamakan Aktivitas Indoor";
        outfitEl.textContent = "Bawa Payung & Jas Hujan";
        healthEl.textContent = "Hati-hati Jalan Licin";
    } else if (temp >= 32) {
        activityEl.textContent = "Gunakan Sunscreen Saat Keluar";
        outfitEl.textContent = "Pakaian Tipis & Baju Cerah";
        healthEl.textContent = "Perbanyak Minum Air Putih";
    } else if (temp <= 20) {
        activityEl.textContent = "Cukup Nyaman Buat Jalan Santai";
        outfitEl.textContent = "Gunakan Jaket / Sweater";
        healthEl.textContent = "Jaga Suhu Tubuh Tetap Hangat";
    } else {
        activityEl.textContent = "Sangat Cocok Olahraga Outdoor";
        outfitEl.textContent = "Pakaian Kasual Nyaman";
        healthEl.textContent = "Kondisi Udara & Suhu Ideal";
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

    currentWeatherSection.textContent = "";
    highlightSection.textContent = "";
    hourlyForecastSection.textContent = "";
    forecastSection.textContent = "";

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
        triggerWeatherEffects(icon);

        const card = $("div", { class: "card card-lg current-weather-card animate-card" });

        const cardTitle = $("h2", { class: "title-2 card-title", text: "NOW" });

        const wrapper = $("div", { class: "wrapper" });
        const tempHeading = $("p", { class: "heading" });
        tempHeading.textContent = `${parseInt(temp)}\u00B0`;
        const tempSup = document.createElement("sup");
        tempSup.textContent = "c";
        tempHeading.append(tempSup);
        const iconImg = $("img", {
            class: "weather-icon",
            attrs: {
                src: `./assets/images/weather_icons/${icon}.png`,
                width: "64",
                height: "64",
                alt: description,
                title: "",
            },
        });
        wrapper.append(tempHeading, iconImg);

        const descriptionP = $("p", { class: "body-3", text: description });

        const metaList = $("ul", { class: "meta-list" });

        const metaItem1 = $("li", { class: "meta-item" });
        const metaIcon1 = $("span", { class: "m-icon", text: "Calendar_today" });
        const metaText1 = $("p", {
            class: "title-3 meta-text",
            text: module.getDate(dateUnix, timezone),
        });
        metaItem1.append(metaIcon1, metaText1);

        const metaItem2 = $("li", { class: "meta-item" });
        const metaIcon2 = $("span", { class: "m-icon", text: "Location_on" });
        const metaText2 = $("p", {
            class: "title-3 meta-text",
            attrs: { "data-location": "" },
        });
        metaItem2.append(metaIcon2, metaText2);

        metaList.append(metaItem1, metaItem2);

        card.append(cardTitle, wrapper, descriptionP, metaList);

        fetchData(
            url.reverseGeo(lat, lon),
            function ([{ name, country }]) {
                const locationEl = card.querySelector("[data-location]");
                locationEl.textContent = `${name}, ${country}`;
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
                const card = $("div", { class: "card card-lg animate-card" });

                const highlightsTitle = $("h2", {
                    class: "title-2",
                    attrs: { id: "highlights-label" },
                    text: "Todays Highlights",
                });

                const highlightsList = $("div", { class: "highlights-list" });

                // ---- Air Quality Index ----
                const aqiCard = $("div", { class: "card card-sm highlights-card one" });
                const aqiTitle = $("h3", { class: "title-3", text: "Air Quality Index" });
                const aqiWrapper = $("div", { class: "wrapper" });
                const aqiIcon = $("span", { class: "m-icon", text: "air" });
                const aqiList = $("ul", { class: "card-list" });

                const aqiItems = [
                    { label: "PM", value: Number(pm2_5).toPrecision(3), sub: "" },
                    { label: "SO", value: Number(so2).toPrecision(3), sub: "2" },
                    { label: "NO", value: Number(no2).toPrecision(3), sub: "2" },
                    { label: "O", value: Number(o3).toPrecision(3), sub: "3" },
                ];
                for (const { label, value, sub } of aqiItems) {
                    const li = $("li", { class: "card-item" });
                    const valP = $("p", { class: "title-1", text: value });
                    const labelP = $("p", { class: "label-1" });
                    labelP.textContent = `${label} `;
                    const subEl = document.createElement("sub");
                    subEl.textContent = sub;
                    labelP.append(subEl);
                    li.append(valP, labelP);
                    aqiList.append(li);
                }

                aqiWrapper.append(aqiIcon, aqiList);

                const badge = $("span", {
                    class: `badge aqi-${aqi} label-${aqi}`,
                    attrs: { title: module.aqiText[aqi].message },
                    text: module.aqiText[aqi].level,
                });

                aqiCard.append(aqiTitle, aqiWrapper, badge);
                highlightsList.append(aqiCard);

                // ---- Sunrise & Sunset ----
                const sunCard = $("div", { class: "card card-sm highlights-card two" });
                const sunTitle = $("h3", { class: "title-3", text: "Sunrise & Sunset" });
                const sunList = $("div", { class: "card-list" });

                const sunItems = [
                    { icon: "clear_day", label: "Sunrise", time: module.getTime(sunriseUnix, timezone) },
                    { icon: "clear_night", label: "Sunset", time: module.getTime(sunsetUnix, timezone) },
                ];
                for (const { icon: mIcon, label, time } of sunItems) {
                    const item = $("div", { class: "card-item" });
                    const mIconEl = $("span", { class: "m-icon", text: mIcon });
                    const infoDiv = $("div");
                    const labelP = $("p", { class: "label-1", text: label });
                    const timeP = $("p", { class: "title-1", text: time });
                    infoDiv.append(labelP, timeP);
                    item.append(mIconEl, infoDiv);
                    sunList.append(item);
                }

                sunCard.append(sunTitle, sunList);
                highlightsList.append(sunCard);

                // ---- Humidity ----
                const humCard = $("div", { class: "card card-sm highlights-card" });
                const humTitle = $("h3", { class: "title-3", text: "Humidity" });
                const humWrapper = $("div", { class: "wrapper" });
                const humIcon = $("span", { class: "m-icon", text: "humidity_percentage" });
                const humVal = withSub(`${humidity}`, "%");
                humWrapper.append(humIcon, humVal);
                humCard.append(humTitle, humWrapper);
                highlightsList.append(humCard);

                // ---- Pressure ----
                const presCard = $("div", { class: "card card-sm highlights-card" });
                const presTitle = $("h3", { class: "title-3", text: "Pressure" });
                const presWrapper = $("div", { class: "wrapper" });
                const presIcon = $("span", { class: "m-icon", text: "airwave" });
                const presVal = withSub(`${pressure}`, "hPa");
                presWrapper.append(presIcon, presVal);
                presCard.append(presTitle, presWrapper);
                highlightsList.append(presCard);

                // ---- Visibility ----
                const visCard = $("div", { class: "card card-sm highlights-card" });
                const visTitle = $("h3", { class: "title-3", text: "Visibility" });
                const visWrapper = $("div", { class: "wrapper" });
                const visIcon = $("span", { class: "m-icon", text: "visibility" });
                const visVal = withSub(`${visibility / 1000}`, "Km");
                visWrapper.append(visIcon, visVal);
                visCard.append(visTitle, visWrapper);
                highlightsList.append(visCard);

                // ---- Feels Like ----
                const feelCard = $("div", { class: "card card-sm highlights-card" });
                const feelTitle = $("h3", { class: "title-3", text: "Feels Like" });
                const feelWrapper = $("div", { class: "wrapper" });
                const feelIcon = $("span", { class: "m-icon", text: "Thermostat" });
                const feelVal = withSup(`${parseInt(feels_like)}\u00B0`, "c");
                feelWrapper.append(feelIcon, feelVal);
                feelCard.append(feelTitle, feelWrapper);
                highlightsList.append(feelCard);

                card.append(highlightsTitle, highlightsList);
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

                hourlyForecastSection.textContent = "";

                const hourlyTitle = $("h2", { class: "title-2", text: "Today At" });
                const sliderContainer = $("div", { class: "slider-container" });
                const tempList = $("ul", { class: "slider-list", attrs: { "data-temp": "" } });
                const windList = $("ul", { class: "slider-list", attrs: { "data-wind": "" } });
                sliderContainer.append(tempList, windList);
                hourlyForecastSection.append(hourlyTitle, sliderContainer);

                for (const [index, data] of forecastList.entries()) {
                    if (index > 7) break;
                    const {
                        dt: dateUnix,
                        main: { temp },
                        weather,
                        wind: { deg: windDirection, speed: windSpeed },
                    } = data;
                    const [{ description, icon }] = weather;

                    const tempLi = $("li", { class: "slider-item animate-card" });
                    const tempCard = $("div", { class: "card card-sm slider-card" });
                    const tempTime = $("p", { class: "body-3", text: module.getTime(dateUnix, timezone) });
                    const tempIcon = $("img", {
                        class: "weather-icon",
                        attrs: {
                            src: `./assets/images/weather_icons/${icon}.png`,
                            width: "48",
                            height: "48",
                            loading: "lazy",
                            alt: description,
                            title: description,
                        },
                    });
                    const tempVal = withSup(`${parseInt(temp)}\u00B0`, "c");
                    tempCard.append(tempTime, tempIcon, tempVal);
                    tempLi.append(tempCard);
                    tempList.append(tempLi);

                    const windLi = $("li", { class: "slider-item animate-card" });
                    const windCard = $("div", { class: "card card-sm slider-card" });
                    const windTime = $("p", { class: "body-3", text: module.getTime(dateUnix, timezone) });
                    const windIcon = $("img", {
                        class: "weather-icon",
                        attrs: {
                            src: "./assets/images/weather_icons/direction.png",
                            width: "48",
                            height: "48",
                            loading: "lazy",
                            alt: "Direction",
                            title: "Wind direction",
                            style: `transform: rotate(${windDirection - 180}deg)`,
                        },
                    });
                    const windVal = $("p", { class: "body-3", text: `${parseInt(module.mps_to_kph(windSpeed))}km/h` });
                    windCard.append(windTime, windIcon, windVal);
                    windLi.append(windCard);
                    windList.append(windLi);
                }

                // 5 DAY FORECAST
                forecastSection.textContent = "";

                const forecastTitle = $("h2", { class: "title-2", text: "5 DAYS FORECAST" });
                const forecastCard = $("div", { class: "card card-lg forecast-card" });
                const forecastListEl = $("ul", { attrs: { "data-forecast-list": "" } });
                forecastCard.append(forecastListEl);
                forecastSection.append(forecastTitle, forecastCard);

                for (let i = 7, len = forecastList.length; i < len; i += 8) {
                    const {
                        main: { temp_max },
                        weather,
                        dt_txt,
                    } = forecastList[i];
                    const [{ description, icon }] = weather;
                    const date = new Date(dt_txt);

                    const li = $("li", { class: "card-item animate-card" });
                    const iconWrapper = $("div", { class: "icon-wrapper" });
                    const weatherIcon = $("img", {
                        class: "weather-icon",
                        attrs: {
                            src: `./assets/images/weather_icons/${icon}.png`,
                            width: "36",
                            height: "36",
                            alt: description,
                            title: description,
                        },
                    });
                    const spanEl = $("span", { class: "span" });
                    const tempMax = withSup(`${parseInt(temp_max)}\u00B0`, "c");
                    spanEl.append(tempMax);
                    iconWrapper.append(weatherIcon, spanEl);

                    const dateP = $("p", { class: "label-1", text: `${date.getDate()} ${module.monthNames[date.getMonth()]}` });
                    const dayP = $("p", { class: "label-1", text: module.weekDayNames[date.getDay()] });

                    li.append(iconWrapper, dateP, dayP);
                    forecastListEl.append(li);
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
