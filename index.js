const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

// Define the endpoint to scrape data
app.get("/api/marksix", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto("https://bet.hkjc.com/ch/marksix/results", {
      waitUntil: "networkidle2", // Wait for the network to be idle
    });

    // Scrape the alt values of the images in the "table-row sec" divs
    const markSixResults = await page.evaluate(() => {
      const tableRows = document.querySelectorAll(
        ".maraksx-results-table-noprint .table-row"
      );
      const results = {};

      tableRows.forEach((row) => {
        const images = row.querySelectorAll(".img-box img");
        const key = row.querySelector(".cell-id a").textContent;
        const result = [];
        images.forEach((image) => {
          result.push(image.alt);
        });
        results[key] = result;
      });

      return results;
    });

    await browser.close();

    // Send the scraped data as a JSON response
    res.json(markSixResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error scraping data");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
