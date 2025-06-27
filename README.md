# Telemetry Frontend

A modern, dark-themed analytics dashboard built with React, TypeScript, and Tailwind CSS. Designed to look like Plausible/Umami with clean, minimal aesthetics.

## Features

- 📊 **Real-time Analytics Dashboard**

  - Page view charts with timeline visualization
  - Unique visitor tracking
  - Top pages and referrers analysis
  - Browser, device, and OS statistics
  - Geographic visitor distribution

- 🎨 **Modern UI/UX**

  - Dark theme with beautiful gradients
  - Minimal, clean design inspired by Plausible/Umami
  - Responsive grid layouts
  - Interactive charts with hover effects
  - Smooth animations and transitions

- 🛠 **Tech Stack**
  - React 19 with TypeScript
  - Tailwind CSS for styling
  - Recharts for data visualization
  - Date-fns for date handling
  - React Router for navigation

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your API configuration:

   ```
   VITE_API_BASE_URL=http://localhost:8080
   VITE_DEFAULT_SITE_ID=your-site-id
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   ```

4. **Build for production:**
   ```bash
   pnpm build
   ```

## API Integration

The frontend connects to your analytics API with these endpoints:

- `GET /api/analytics/pageviews?siteId=xxx&startDate=xxx&endDate=xxx`
- `GET /api/analytics/visitors?siteId=xxx&startDate=xxx&endDate=xxx`
- `GET /api/analytics/pages?siteId=xxx&startDate=xxx&endDate=xxx&limit=10`
- `GET /api/analytics/referrers?siteId=xxx&startDate=xxx&endDate=xxx&limit=10`
- `GET /api/analytics/browsers?siteId=xxx&startDate=xxx&endDate=xxx`
- `GET /api/analytics/countries?siteId=xxx&startDate=xxx&endDate=xxx`

## Design Philosophy

- **Dark Theme**: Reduces eye strain during extended use
- **Minimal Interface**: Focus on data, not decoration
- **Consistent Spacing**: Clean grid system for visual harmony
- **Color Coding**: Each chart type has its own accent color
- **Progressive Disclosure**: Important metrics first, details on demand

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
