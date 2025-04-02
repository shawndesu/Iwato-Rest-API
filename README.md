# Hiuraa-API-Base

![Hiuraa API](https://img.shields.io/badge/Hiuraa-API-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**Hiuraa-API-Base** is a simple, yet powerful and highly customizable REST API foundation. Built with Express.js, it provides developers with a solid starting point to create their own API services with minimal setup and maximum flexibility.

## 🌟 Features

- **Simple & Lightweight**: Easy to understand codebase with minimal dependencies
- **Auto-Discovery**: Automatic endpoint registration and documentation
- **Dynamic Module Loading**: Hot-reload capability for API modules
- **Well-Organized Structure**: Category-based endpoint organization
- **Built-in Documentation**: Self-documenting API with endpoint explorer
- **Scraper Integration**: Ready-to-use scraper module for web data extraction
- **Network Ready**: Automatic detection of network interfaces for easier testing

## 📋 Requirements

- Node.js (v18 or higher)
- NPM or Yarn

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Hiuraa-API-Base.git
cd Hiuraa-API-Base
```

2. Install dependencies:
```bash
npm install
```

3. Create a `settings.js` file:
```javascript
module.exports = {
    author: "YourName",
    // Add other settings as needed
};
```

4. Start the server:
```bash
npm start
```

Visit `http://localhost:4000` to see your API in action!

## 🛠️ Creating Endpoints

Creating new endpoints is simple. Just add a JavaScript file to the `api` directory:

```javascript
// api/hello/world.js
module.exports = {
    name: "Hello World",
    desc: "Returns a friendly greeting",
    category: "Greetings",
    params: ["name"],
    run: async (req, res) => {
        const name = req.query.name || "World";
        res.json({
            status: true,
            message: `Hello, ${name}!`
        });
    }
};
```

This automatically creates an endpoint at `/hello/world` with proper documentation.

## ✨ Key Features Explained

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

## 📡 API Endpoints

### Core System Endpoints

- `/` - Documentation homepage
- `/endpoints` - List all available API endpoints
- `/set` - Get server settings

### Your Custom Endpoints

All endpoints are automatically documented and accessible through the `/endpoints` route.

## 📝 License

MIT License - Feel free to use and modify according to your needs.

## 👨‍💻 Author

Created by Rynn

---

Feel free to contribute, report issues, or suggest improvements!