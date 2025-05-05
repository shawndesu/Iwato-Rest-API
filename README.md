## Iwato Rest API

Iwato Rest API is a modern, interactive API documentation and testing interface built with **Node.js**, **Express**, **Tailwind CSS**, and **JavaScript**. It provides a sleek, dark-themed dashboard for developers to explore, test, and integrate RESTful endpoints with ease.

---

## 🚀 Features

* **Interactive API Testing**: Send requests and view responses directly from the dashboard.
* **Dark Theme UI**: Responsive, dark-styled interface with smooth animations.
* **Organized Navigation**: Sidebar categorized by groups with search and keyboard shortcut (Ctrl+K).
* **Live Response Viewer**: Syntax-highlighted JSON viewer with formatting and copy-to-clipboard.
* **Notifications Center**: Real-time alerts persisted in `localStorage`.
* **Customizable Settings**: Configure appearance and behavior via `settings.js` or `settings.json`.
* **Statistics Dashboard**: Overview of total endpoints, category breakdown, and HTTP method metrics.
* **Mobile-First Design**: Fully responsive layouts for desktop, tablet, and mobile.
* **Loading States**: Built-in transitions and loading indicators for seamless UX.
* **Auto-Discovery**: Automatically detects and lists endpoint modules placed in `/endpoints`.

---

## 🔗 Live Demo

Explore a working demo:

> [https://iwato-rest-api.vercel.app/](https://iwato-rest-api.vercel.app)

---

## 🛠️ Installation

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or later)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Steps

```bash
# Clone the repository
git clone https://github.com/shawndesu/Iwato-Rest-API.git

# Navigate into the project directory
cd Iwato-Rest-API

# Install dependencies
npm install
# or
yarn install

# Configure your settings
# Edit settings.js or settings.json in the project root

# Start the server
npm start
# or
yarn start
```

By default, the dashboard will be available at `http://localhost:4000`.

---

## ⚙️ Configuration

Customize the dashboard by editing **`settings.js`** or **`settings.json`** in the root:

```js
module.exports = {
  name: 'Iwato Rest API',         // Display name
  version: '1.0.0',              // Interface version
  description: 'Modern API explorer and tester.',
  icon: '/images/icon.png',      // Path to header icon
  author: 'ShawnDesu',           // Display author (or 'auto' to fetch from GitHub)
  notifications: [               // Initial notifications
    { title: 'Welcome!', message: 'Explore available endpoints and test them.' },
    { title: 'v1.0.0 Released', message: 'Dashboard and core features are live.' }
  ]
};
```

---

## 📄 Defining Endpoints

Each endpoint is a self-contained Node.js module in the `/endpoints` directory. It should export a **`meta`** object and an **`onStart`** function.

### Example: Hello Endpoint

```js
// /endpoints/hello.js
const meta = {
  name: 'hello',               // Unique endpoint name
  desc: 'Returns a greeting message',
  method: 'get',               // API endpoints method
  category: 'examples',        // Sidebar category
  params: ['name'],            // Query or body parameters
};

async function onStart({ req, res }) {
  const { name } = req.query;
  const greeting = name ? `Hello, ${name}!` : 'Hello, World!';

  return res.json({
    message: greeting,
    timestamp: new Date().toISOString(),
    powered_by: 'Iwato Rest API'
  });
}

module.exports = { meta, onStart };
```

* Place the file under `/endpoints` and restart the server.
* The dashboard will list it under the **Examples** category.

> **Note:** The structure of `settings.js` and endpoint modules must be preserved. Custom modifications should align with the documented format to ensure compatibility with the dashboard auto-discovery and rendering logic.

---

## 🎨 Dashboard Overview

1. **Sidebar**: Categories, search box (Ctrl+K), collapsible menus.
2. **Endpoint Panel**: Description, parameters form, and **Send** button.
3. **Response Viewer**: Pretty-printed JSON with copy functionality.
4. **Notifications**: Bell icon shows unread count and message list.
5. **Statistics**: Summary cards for total endpoints and HTTP method usage.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

## ❤️ Credits

* **[Rynn](https://github.com/rynxzyy)**: Original creator and author.
* **[Lenwy](https://github.com/Lenwyy)**: Concept inspiration.
* **[ShawnDesu](https://github.com/shawndesu)**: UI/UX redesign and enhancements.

Thank you to everyone who contributed and provided feedback!
