export default async function handler(req, res) {
    const apiKey = process.env.WEATHER_API_KEY;
    const requestedUrl = req.query.url;

    if (typeof requestedUrl !== "string") {
        return res.status(400).json({ error: "A valid URL is required" });
    }

    if (!apiKey) {
        return res.status(500).json({ error: "Weather API is not configured" });
    }

    let targetUrl;
    try {
        targetUrl = new URL(requestedUrl);
    } catch {
        return res.status(400).json({ error: "A valid URL is required" });
    }

    const allowedPaths = new Set([
        "/data/2.5/weather",
        "/data/2.5/forecast",
        "/data/2.5/air_pollution",
        "/geo/1.0/reverse",
        "/geo/1.0/direct",
    ]);

    if (
        targetUrl.protocol !== "https:" ||
        targetUrl.hostname !== "api.openweathermap.org" ||
        !allowedPaths.has(targetUrl.pathname)
    ) {
        return res.status(400).json({ error: "Unsupported weather API URL" });
    }

    targetUrl.searchParams.set("appid", apiKey);

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        return res.status(response.status).json(data);
    } catch {
        return res.status(502).json({ error: "Failed to fetch weather data" });
    }
}
