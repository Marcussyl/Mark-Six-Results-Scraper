const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors"); // Add CORS support

const app = express();
app.use(cors()); // Enable CORS

// Add simple caching
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
    data: null,
    timestamp: null
};

app.get("/", async (req, res) => {
    try {
        // Check cache first
        if (cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION)) {
            return res.json(cache.data);
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for some hosting platforms
            headless: "new" // Use new headless mode
        });
        const page = await browser.newPage();

        // Add timeout and error handling
        await page.setDefaultNavigationTimeout(30000); // 30 seconds timeout

        // Navigate to the website
        await page.goto("https://bet.hkjc.com/ch/marksix/results", {
            waitUntil: ["networkidle2", "domcontentloaded"], // Wait for both conditions
        });

        // Add error handling for selector
        await page.waitForSelector(".maraksx-results-table-noprint .table-row");

        const markSixResults = await page.evaluate(() => {
            const tableRows = document.querySelectorAll(
                ".maraksx-results-table-noprint .table-row"
            );
            const results = {};

            tableRows.forEach((row) => {
                try {
                    const idElement = row.querySelector(".cell-id a");
                    if (!idElement) return; // Skip if no ID element

                    const key = idElement.textContent.trim();
                    const images = row.querySelectorAll(".img-box img");
                    const result = Array.from(images).map(img => img.alt).filter(Boolean);
                    
                    if (key && result.length > 0) {
                        results[key] = result;
                    }
                } catch (err) {
                    console.error('Error processing row:', err);
                }
            });

            return results;
        });

        await browser.close();

        // Update cache
        cache = {
            data: markSixResults,
            timestamp: Date.now()
        };

        res.json(markSixResults);
    } catch (error) {
        console.error("Scraping error:", error);
        
        // Return cached data if available on error
        if (cache.data) {
            console.log("Returning cached data due to error");
            return res.json(cache.data);
        }
        
        res.status(500).json({
            error: "Error scraping data",
            message: error.message
        });
    }
});

// Add health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    process.exit(0);
});
