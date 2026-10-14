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

    // --- Cek Keamanan Diperlonggar ---
    const allowedPaths = ["/data/2.5/weather", "/data/2.5/forecast", "/data/2.5/air_pollution", "/geo/1.0/reverse", "/geo/1.0/direct"];

    // Cek apakah pathname mengandung salah satu dari allowedPaths
    const isPathAllowed = allowedPaths.some((path) => targetUrl.pathname.includes(path));

    if (targetUrl.protocol !== "https:" || targetUrl.hostname !== "api.openweathermap.org" || !isPathAllowed) {
        return res.status(400).json({
            error: "Unsupported weather API URL",
        });
    }
    // ---------------------------------

    // Menambahkan API key dengan aman ke dalam URL
    targetUrl.searchParams.set("appid", apiKey);

    try {
        const response = await fetch(targetUrl);
        const data = await response.json();

        // Tambahkan header untuk mencegah error CORS di browser
        res.setHeader("Access-Control-Allow-Credentials", true);
        res.setHeader("Access-Control-Allow-Origin", "*");

        return res.status(response.status).json(data);
    } catch (err) {
        return res.status(502).json({ error: "Failed to fetch weather data" });
    }
}
