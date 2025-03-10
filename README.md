# Mark Six Results Scraper

This project is an Express server that scrapes the latest Mark Six results from the Hong Kong Jockey Club's website and returns the results as JSON. The server also includes simple caching to minimize repeated scraping and improve performance.

## Features

- Scrapes the latest Mark Six results from the specified website
- Returns the results as a JSON response
- Includes simple caching to reduce load and improve performance
- Error handling to manage unexpected issues

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Marcussyl/puppeteer-server.git
    cd puppeteer-server
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

### Usage

1. Start the server:

    ```bash
    npm start
    ```

2. The server will run on `http://localhost:3000` by default. You can access the following endpoints:

    - `GET /`: Returns a message instructing the user to request `/mark-six-results` to retrieve the latest Mark Six results.
    - `GET /mark-six-results`: Scrapes the latest Mark Six results and returns them as a JSON response.

### Example Response

#### `GET /mark-six-results`

```json
[
  {
    "id": "25/026",
    "results": ["19", "25", "26", "29", "32", "39", "4"]
  },
  {
    "id": "25/025",
    "results": ["4", "11", "19", "20", "30", "39", "45"]
  }
  // ...more results
]
