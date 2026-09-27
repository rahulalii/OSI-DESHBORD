# 🕵️ OSINT Intelligence Platform

A professional, frontend-only Open-Source Intelligence (OSINT) investigation dashboard built with vanilla HTML5, CSS3, and JavaScript.

<img width="1831" height="901" alt="Screenshot 2026-09-27 080854" src="https://github.com/user-attachments/assets/7b9b76b6-8bf6-4dff-9a10-9afe9d8653f0" />


## 🎯 Overview

This platform provides a robust, locally running dashboard for managing OSINT investigations, cataloging evidence, and visualizing relationships. Designed for authorized cybersecurity research, education, and analysis without the need for external server dependencies.

## 🚀 Quick Start

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Click "Launch Investigation" to enter the dashboard
4. No server, no build step, no dependencies required

## 📋 Features

### Investigation Modules
- 🌐 Websites & Search Engines
- 📱 Social Media & Public Profiles
- 📰 News & Public Records
- 🗺️ Maps & Geolocation
- 📧 Email & Domain Intelligence
- 🔎 Username & Domain Investigation
- 🖼️ Image & Video Intelligence
- 🔐 Cybersecurity Threat Intelligence
- 🧩 Intelligence Correlation

### Core Features
- 📊 Interactive Analytics Dashboard
- 📋 Investigation Management
- 📎 Evidence Collection & Management
- 🔍 Findings Tracking
- 🕒 Investigation Timeline
- 📄 Report Generation
- 💾 Local Data Storage (localStorage)
- 🔍 Global Search & Command Palette
- ⌨️ Keyboard Shortcuts
- 📱 Responsive Design

## 🏗️ Project Structure

```
osint-dashboard/
├── index.html            # Landing page
├── dashboard.html        # Main dashboard view
├── investigations.html   # Investigations management
├── tools.html            # OSINT tools/modules list
├── reports.html          # Reports generator & analytics
├── documentation.html    # User guide and docs
├── settings.html         # Application settings
├── css/
│   ├── style.css         # Base styles and variables
│   ├── dashboard.css     # Component styles
│   └── responsive.css    # Media queries
└── js/
    ├── app.js            # Core application logic
    ├── storage.js        # LocalStorage data manager
    ├── ui.js             # UI components and helpers
    └── reports.js        # Reports specific logic
```

## 🔧 Technology Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Grid, Flexbox, Animations, Glassmorphism
- **JavaScript** — ES6+, DOM manipulation, localStorage API, File API, SVG charts
- **No frameworks or libraries**

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Command Palette |
| Ctrl+N | New Investigation |
| Ctrl+S | Save |
| Ctrl+E | Export Data |
| Escape | Close Modal |

## 🔌 API Integration

This platform is designed as a frontend-only application. However, it can be extended with backend APIs:

- Replace demo data functions with actual API calls
- Add authentication layer
- Connect to OSINT APIs (Shodan, VirusTotal, etc.) via your own backend proxy
- Store data in a proper database

**Important:** Never expose API keys in frontend code. Always use a backend proxy.

## 🛡️ Security & Privacy

This platform is designed for:
- ✅ Authorized research
- ✅ Educational purposes
- ✅ Cybersecurity analysis
- ✅ Publicly available information

This platform does NOT:
- ❌ Harvest credentials
- ❌ Bypass authentication
- ❌ Access private accounts
- ❌ Deploy malware
- ❌ Perform unauthorized surveillance

## 📦 Data Storage

All data is stored in the browser's localStorage:
- No data is sent to any external server
- Data persists between sessions
- Export/Import functionality for data portability
- Demo data is clearly labeled

## 🌐 Browser Support

- Chrome 90+
- Firefox 90+
- Edge 90+
- Safari 15+

## 📄 License

For authorized research and educational purposes only.

## ⚠️ Disclaimer

This platform is designed for authorized cybersecurity research, digital investigations, and educational purposes only. Users are responsible for ensuring their activities comply with all applicable laws and regulations. All demo data is fictional.
