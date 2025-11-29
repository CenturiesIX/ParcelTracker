# Tracketta

Tracketta is a public package tracking hub that aggregates tracking for UPS, FedEx, USPS, DHL, LaserShip, and Amazon Logistics into a single clean interface. It is a proprietary, closed-source project intended for demonstration within this repository.

## Technology stack
- Node.js with Express backend
- SQLite for storing tracking history and settings
- axios + cheerio scraping of public tracking pages
- Vanilla JavaScript, HTML5, CSS3 frontend

## Running locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 in your browser.

## Development notes
- No external API keys are required; tracking data is gathered via scraping public tracking pages.
- History and settings are persisted in `backend/db/tracketta.sqlite` automatically.
- The frontend is fully static and served from the `public` directory.

## License
See [LICENSE](LICENSE) for proprietary terms.
