import express from "express";
import puppeteer from "puppeteer";
import cors from "cors"
import serverless from "serverless-http";

const app = express();
app.use(cors()); // Enable CORS

// Add simple caching
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
    data: null,
    timestamp: null
};


// This route handles the GET request for the root URL ("/").
// It returns a JSON response with a message instructing the user to request "/mark-six-results" to retrieve the 10 latest Mark Six results.
app.get("/", async(req, res) => {
    try {
        const message = "Request /mark-six-results to retrieve the 10 latest Mark Six results";
        res.json({ message });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "An unexpected error occurred."
        });
    }
});

// This route handles the GET request for the "/mark-six-results" endpoint.
// It scrapes the latest Mark Six results from the website and returns them as a JSON response.
// The results are cached for a specified duration to minimize repeated scraping and improve performance.
app.get("/mark-six-results", async(req, res) => {
    try {
        // Check cache first
        if (cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION)) {
            return drawResults.json(cache.data);
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for some hosting platforms
            headless: true // Use new headless mode
        });
        const page = await browser.newPage();

        // Add timeout and error handling
        await page.setDefaultNavigationTimeout(30000); // 30 seconds timeout

        // Navigate to the website
        await page.goto("https://bet.hkjc.com/ch/marksix/results", {
            waitUntil: ["networkidle2", "domcontentloaded"], // Wait for both conditions
        });

        // table row selector
        const tableRowSelector = '.maraksx-results-table-noprint .table-row';
        await page.waitForSelector(tableRowSelector);

        // extraction starts
        const drawResults = await page.evaluate(tableRowSelector => {
            const tableRowsHtml = Array.from(document.querySelectorAll(tableRowSelector));
            const res = []
            for (let row of tableRowsHtml) {
                // find draw id
                const id = row.querySelector('.cell-id a').innerHTML;

                // find draw result
                const result = [];
                const resultImgs = row.querySelectorAll('.cell-ball-list .img-box img')
                for (let img of resultImgs) {
                    result.push(img.getAttribute('alt'));
                }

                // combine draw id and result for each draw
                const temp = {
                    id: id,
                    results: result
                }

                res.push(temp);
            }
            return res;
        }, tableRowSelector);

        await browser.close();

        // Update cache
        cache = {
            data: drawResults,
            timestamp: Date.now()
        };

        console.log(JSON.stringify(drawResults));
        res.json(drawResults)
    } catch (error) {
        console.error("Scraping error:", error);

        res.status(500).json({
            error: "Error scraping data",
            message: error.message
        });
    }
});

export const handler = serverless(app);