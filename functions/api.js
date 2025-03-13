import ServerlessHttp from "serverless-http";
import express from "express";
import puppeteer from "puppeteer";
import dotenv from 'dotenv'
import fs from "fs";
import path from "path";

const app = express();
const filePath = path.resolve(__dirname + "/data.json");
dotenv.config();

app.use(express.json());

app.get('/api', (req, res) => {
    return res.json({
        message: "Welcome to Mark Six Checker API!"
    })
})

app.get('/api/mark-six-results', async (req, res) => {
    try {
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
        console.log(JSON.stringify(drawResults));
        res.json(drawResults)
    } catch (error) {
        console.error("Scraping error:", error);

        res.status(500).json({
            error: "Error scraping data",
            message: error.message
        });
    }
})

app.post('/api/backupState', (req, res) => {
    const draws = req.body;
    
    console.log(draws);

    fs.writeFile(filePath, JSON.stringify(draws, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file", err);
        return res.status(500).json({ message: "Error backing up state" });
      }

      return res.status(200).json({
        message: "all good",
      });
    });
})

app.get("/api/getState", (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file", err);
      return res.status(500).json({ message: "Error retrieving state" });
    }

    try {
      const state = JSON.parse(data);
      return res.status(200).json(state);
    } catch (parseError) {
      console.error("Error parsing JSON", parseError);
      return res.status(500).json({ message: "Error parsing state data" });
    }
  });
});

// app.listen(3002, () => {
//     console.log("Listening on port 3002");
// })

const handler = ServerlessHttp(app);
module.exports.handler = async (event, context) => {
    const result = await handler(event, context);
    return result;
}