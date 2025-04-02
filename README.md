# Hiuraa-API-Base

![Hiuraa API](https://img.shields.io/badge/Hiuraa-API-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**Hiuraa-API-Base** is a simple, yet powerful and highly customizable REST API foundation. Built with Express.js, it provides developers with a solid starting point to create their own API services with minimal setup and maximum flexibility.

## Features

- Simple & Lightweight: Easy to understand codebase with minimal dependencies
- Auto-Discovery: Automatic endpoint registration and documentation
- Dynamic Module Loading: Hot-reload capability for API modules
- Well-Organized Structure: Category-based endpoint organization
- Scraper Integration: Ready-to-use scraper module for web data extraction
- Network Ready: Automatic detection of network interfaces for easier testing
- Vercel Deployment: One-click deployment to Vercel

## Requirements

- Node.js (v18 or higher)
- NPM or Yarn

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/rynxzyy/Hiuraa-API-Base.git
cd Hiuraa-API-Base
```

2. Install dependencies:
```bash
npm install
```

3. Modify the `settings.js` file:
```javascript
module.exports = {
    name: {
        main: 'Hiuraa API Base !!',
        copyright: 'Hiuraa API Base'
    },
    description: 'Integrated API solution for your modern application development needs. Fast, secure, and reliable access.',
    author: 'Rynn',
    info_url: 'https://whatsapp.com/channel/0029Vb9MIdiDDmFXasVPVG1t',
    links: [
        {
            name: 'WhatsApp Information Ch.',
            url: 'https://whatsapp.com/channel/0029Vb9MIdiDDmFXasVPVG1t'
        }
    ]
};
```

4. Start the server:
```bash
npm start
```

Visit `http://localhost:4000` to see your API in action!

## Deploy to Vercel

You can easily deploy your Hiuraa API to Vercel:

1. Click the deploy button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frynxzyy%2FHiuraa-API-Base)

2. Follow the on-screen instructions
3. Configure environment variables if needed
4. Deploy!

## Creating Endpoints

Creating new endpoints is simple. Just add a JavaScript file to the `api` directory:

```javascript
module.exports = {
    name: "Hello World",
    desc: "Returns a friendly greeting",
    category: "Greetings",
    params: ["name"],
    async run(req, res) {
        const name = req.query.name || "World";
        res.json({
            status: true,
            message: `Hello, ${name}!`
        });
    }
};
```

This automatically creates an endpoint at `/hello/world` with proper documentation.

## Key Features Explained

### Automatic Endpoint Registration

The system will automatically:
- Discover and register all `.js` files in the `api` directory and subdirectories
- Generate documentation based on module properties
- Organize endpoints by categories
- Display URLs with required parameters

### Scraper Module

A built-in scraper system that:
- Auto-loads from the `lib/scrape_file` directory
- Hot-reloads on changes (every 2 seconds)
- Provides a global `scraper` object

## API Endpoints

### Core System Endpoints

- `/` - Documentation homepage
- `/endpoints` - List all available API endpoints
- `/set` - Get server settings

### Your Custom Endpoints

All endpoints are automatically documented and accessible through the `/endpoints` route.

## License

[MIT License](LICENCE) - Feel free to use and modify according to your needs.

## Author

Created by Rynn

---

Feel free to contribute, report issues, or suggest improvements!