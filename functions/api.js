import ServerlessHttp from "serverless-http";
import express from "express";
import puppeteer from "puppeteer";
import dotenv from 'dotenv'
import fs from "fs";
import path from "path";

const app = express();
dotenv.config();

app.use(express.json());

app.get('/api', (req, res) => {
    return res.json({
        message: "Welcome to Mark Six Checker API!"
    })
})

app.get('/api/mark-six-results', async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;
        const browser = await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.TOKEN}`,
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
        let drawResults = await page.evaluate(tableRowSelector => {
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
        console.log(JSON.stringify(drawResults));
        drawResults = drawResults.slice(0, count);
        res.json(drawResults)
    } catch (error) {
        console.error("Scraping error:", error);

        res.status(500).json({
            error: "Error scraping data",
            message: error.message
        });
    }
})

app.put('/api/backupState', async (req, res) => {
    const draws = req.body;
    console.log(draws);
    // console.log(process.env.BinUrl);
    
    try {
      const response = await fetch(process.env.BinUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": process.env.AccessKey,
        },
        body: JSON.stringify(draws),
      });

      if (!response.ok) {
        const errorMessage = `Error: ${response.status} ${response.statusText}`;
        console.error(errorMessage);
        return res.status(response.status).json({ message: errorMessage });
      }

      const data = await response.json();
      console.log("Update successful:", data);
      return res.status(200).json({
        message: "Update successful",
        data: data,
      });
    } catch (error) {
      console.error("Error updating resource:", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
})

app.get("/api/getState", async (req, res) => {
  try {
        const response = await fetch(process.env.BinUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Access-Key": process.env.AccessKey,
          },
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            const errorMessage = `Error: ${response.status} ${response.statusText}`;
            console.error(errorMessage);
            return res.status(response.status).json({ message: errorMessage });
        }

        const data = await response.json();
        console.log("Data retrieved successfully:", data);
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// app.listen(3002, () => {
//     console.log("Listening on port 3002");
// })

const handler = ServerlessHttp(app);
module.exports.handler = async (event, context) => {
    const result = await handler(event, context);
    return result;
}