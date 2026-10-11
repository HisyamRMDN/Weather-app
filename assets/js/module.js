"use strict";

export const weekDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// @param {number} dateUnix - Unix timestamp
// @param {number} timezone - Timezone shift from UTC in seconds
// @return {string} Date in format "Sunday 10, January"
export const getDate = function (dateUnix, timezone) {
    const date = new Date(dateUnix + timezone);
    const weekDayName = weekDayNames[date.getUTCDay()];
    const monthName = monthNames[date.getUTCMonth()];
    return `${weekDayName} ${date.getUTCDate()}, ${monthName}`;
};

// @param {number} timeUnix - Unix timestamp
// @param {number} timezone - Timezone shift from UTC in seconds
// @return {string} Time in format "10:00 AM"
export const getTime = function (timeUnix, timezone) {
    const date = new Date(timeUnix + timezone) * 1000;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12}:${minutes} ${period}`;
};

// @param {number} timeUnix - Unix timestamp
// @param {number} timezone - Timezone shift from UTC in seconds
// @return {string} Time in format "10:00 AM"
export const getHours = function (timeUnix, timezone) {
    const date = new Date(timeUnix + timezone) * 1000;
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    return `${hours % 12 || 12}:${minutes} ${period}`;
};

// @param {number} mps - Miles per second
// @return {number} Kilometers per hour
export const mps_to_kph = (mps) => {
    const mph = mps * 3600;
    return mph / 1000;
};

export const aqiText = {
    1: {
        level: "good",
        message: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
    },
    2: {
        level: "moderate",
        message: "Air quality is moderate, there is a moderate likelihood that air pollution will decrease over time with a decreasing level of outdoor particulate matter.",
    },
    3: {
        level: "unhealthy",
        message: "number of outdoor PM2.5 particles in the air is such that people are experiencing health effects related to air pollution.",
    },
    4: {
        level: "hazardous",
        message: "everyone is experiencing health effects related to air pollution. members of sensitive groups may experience health effects related to air pollution.",
    },
    5: {
        level: "very_unhealthy",
        message: "health warning of highest level for sensitive groups. everyone may experience health effects related to air pollution.",
    },
};
