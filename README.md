# Victoria Autos Frontend

React-based web application for the Victoria Autos vehicle dealership platform.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **UI Framework:** Bootstrap 5 + React Bootstrap + Reactstrap
- **Styling:** SASS
- **Animations:** Framer Motion
- **Charts:** Chart.js + react-chartjs-2
- **Carousel:** Swiper

## Features

- 🚗 Vehicle showcase/vitrina with filtering and search
- 🏠 Dynamic home page with hero banner and carousels
- 💰 Credit/financing calculator
- 📝 Multi-step vehicle selling form
- 👤 User authentication
- 🔐 Protected admin dashboard
- 📊 Analytics dashboard with charts
- 📱 Responsive mobile-first design
- 🔒 Google reCAPTCHA integration
- 🎨 Smooth animations and transitions

## Project Structure

```
victoriautosFrontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Icons, images, brand logos
│   ├── components/
│   │   ├── admin/       # Admin panel components
│   │   │   ├── Dashboard/
│   │   │   ├── Compra/
│   │   │   ├── Consulta/
│   │   │   ├── Negocios/
│   │   │   ├── ofertas-components/
│   │   │   ├── Tramites/
│   │   │   └── vitrina-vehiculos-component/
│   │   ├── home/        # Homepage components
│   │   ├── vitrina-components/  # Vehicle showcase
│   │   ├── vende-component/     # Multi-step selling form
│   │   ├── financiacion/        # Credit calculator
│   │   ├── Login/
│   │   └── shared/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── redux/
│   │   ├── actions/     # Redux action creators
│   │   ├── slices/      # Redux Toolkit slices
│   │   └── configureStore.jsx
│   ├── routes/          # Route definitions
│   ├── services/        # API and utility services
│   ├── styles/          # Global SCSS styles
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── vite.config.js       # Vite configuration
└── eslint.config.js     # ESLint configuration
```

## Prerequisites

- Node.js (v18+ recommended)
- Yarn package manager
- Backend server running on port 3005

## Installation

```bash
# Install dependencies
yarn install
```

## Development

```bash
# Start development server
yarn dev
```

The development server runs with a proxy to the backend at `http://localhost:3005`.

## Building for Production

```bash
# Create production build
yarn build

# Preview production build locally
yarn preview
```

## Linting

```bash
yarn lint
```

## Build Optimizations

The Vite configuration includes:

- **Code Splitting:** Vendor chunks for React, UI libraries, and animations
- **CSS Purging:** Unused CSS removal via PurgeCSS
- **Minification:** Terser with console/debugger removal
- **Chunk Size Limits:** 500KB warning threshold

## Proxy Configuration

Development server proxies:
- `/api/*` → `http://localhost:3005`
- `/images/*` → `http://localhost:3005`

## Key Dependencies

### UI & Styling
- `bootstrap` / `react-bootstrap` / `reactstrap` - UI components
- `sass` - CSS preprocessing
- `framer-motion` - Animations
- `swiper` - Touch slider/carousel

### State & Routing
- `@reduxjs/toolkit` / `react-redux` - State management
- `react-router-dom` - Client-side routing

### Utilities
- `axios` - HTTP client
- `chart.js` / `react-chartjs-2` - Data visualization
- `react-google-recaptcha` - Bot protection
- `react-helmet-async` - Document head management

## Related Projects

- [victoriautosServer](../victoriautosServer) - Backend API server

## License

Private - All rights reserved
