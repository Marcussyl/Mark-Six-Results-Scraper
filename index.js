const puppeteer = require("puppeteer");

// (async() => {
//     // Launch a new browser instance
//     const browser = await puppeteer.launch({
//         headless: true,
//     });

//     // Create a new page
//     const page = await browser.newPage();

//     // Navigate to the target website
//     await page.goto("https://bet.hkjc.com/ch/marksix/results");

//     // Extract the page title
//     const pageTitle = await page.title();
//     console.log("Page Title:", pageTitle);

//     // Extract the page content
//     const pageContent = await page.content();
//     console.log("Page Content:", pageContent);

//     // Close the browser
//     await browser.close();
// })();

(async() => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto("https://bet.hkjc.com/ch/marksix/results");

    // Scrape the alt values of the images in the "table-row sec" divs
    const altValues = await page.evaluate(() => {
        const tableRows = document.querySelectorAll(".table-row.sec");
        const results = {};

        tableRows.forEach((row, index) => {
            const images = row.querySelectorAll(".img-box img");
            console.log(images);
            const result = [];
            images.forEach((image) => {
                result.push(image.alt);
            });
            results[index + 1] = result;
        });

        return results;
    });

    // Log the alt values
    console.log(altValues);

    await browser.close();
})();

// (async() => {
//     const browser = await puppeteer.launch({
//         headless: true,
//     });
//     const page = await browser.newPage();
//     await page.goto("https://bet.hkjc.com/ch/marksix/results");

//     const altValues = {};
//     const tableRows = page.$$eval(".table-row.sec", (rows) =>
//         rows.map((row, index) => {
//             const altValues = Array.from(row.querySelectorAll("img")).map((img) =>
//                 img.getAttribute("alt")
//             );
//             return { index: index + 1, altValues };
//         })
//     );

//     tableRows.forEach(({ index, altValues }) => {
//         altValues.forEach((alt) => {
//             if (!altValues[index]) {
//                 altValues[index] = [alt];
//             } else {
//                 altValues[index].push(alt);
//             }
//         });
//     });

//     console.log(altValues);

//     await browser.close();
// })();