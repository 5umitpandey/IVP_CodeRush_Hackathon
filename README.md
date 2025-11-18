# IVP CodeRush Hackathon

## Overview
A single-page application built with React + TypeScript and Vite. Fast dev server, optimized production builds, and utility-first styling with Tailwind CSS. Entry points: `src/App.tsx` and `src/main.tsx`.

## About src/App.tsx
This project’s main UI and logic live in `src/App.tsx`. High-level summary:

- Purpose: Implements the MoodFlow single-page UI for capturing daily mood-related data, visualizing trends, and generating basic reports — entirely client-side.
- Data model: Defines a MoodEntry with id, date, sleep, stress, symptoms, mood, engagement, drugNames, and notes.
- State:
  - entries: array of MoodEntry (persisted to localStorage).
  - activeTab: UI tab selector ('entry' | 'charts' | 'reports').
  - formData & errors: form inputs and validation errors for the daily entry form.
- Persistence: Loads entries from `localStorage` on mount and writes back whenever entries change.
- Form handling & validation:
  - validateDate: requires a date within the last year.
  - validateNumber: validates numeric ranges (sleep 0–24; stress/symptoms/mood/engagement 1–10).
  - sanitizeString: strips unsafe characters and limits length.
  - Notes must be at least 10 characters.
  - On submit, new entries replace any entry with the same date and entries are sorted by date (newest first).
- Analytics & charts:
  - Uses Chart.js + react-chartjs-2 to render Line (mood/stress/engagement), Bar (sleep), and Pie (drug impact) charts.
  - Charts use the last 30 entries (if available).
- Drug analysis:
  - Parses comma-separated `drugNames`, normalizes them, and computes average mood per drug.
  - Displays results in a pie chart and a sortable table with usage counts and categorized average mood badges.
- UI:
  - Tabbed layout: Daily Entry, Analytics, Reports.
  - Tailwind CSS for styling and responsive layout.
  - Accessible, client-only flow with immediate visual feedback for validation errors.

Notes & considerations:
- All data is stored locally (no backend). For sensitive health data consider adding encryption, backups, or a secure backend with authentication.
- Validation and sanitization are basic — extend server-side if you add a backend.
- Charts and layout can be customized in `src/App.tsx` (colors, ranges, and chart options).

## Features
- Modern React + TypeScript architecture
- Fast development with Vite
- Tailwind CSS for styling
- Docker-ready and AWS deployment support

## Tech stack
- Framework: React (TypeScript) — entry: `src/App.tsx`, `src/main.tsx`
- Bundler/dev server: Vite — config: `vite.config.ts`
- Language: TypeScript — configs: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Styling: Tailwind CSS (`tailwind.config.js`) + PostCSS (`postcss.config.js`), main styles at `src/index.css`
- Containerization & deployment: Docker (`Dockerfile`), AWS Elastic Beanstalk manifest (`deploy/Dockerrun.aws.json`)
- Project metadata & scripts: `package.json`
- Static entry: `index.html`

## Prerequisites
- Node.js (LTS)
- npm (or yarn)
- Docker (optional, for container builds)

## Installation
1. Install dependencies:
```sh
npm install
```

## Usage
- Run the dev server:
```sh
npm run dev
```

## Configuration
- `tsconfig.json`: TypeScript configuration
- `tsconfig.app.json`: Application-specific TypeScript configuration
- `tsconfig.node.json`: Node.js-specific TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `src/index.css`: Main styles

## Testing
- Run tests:
```sh
npm test
```

## Screenshots!
![Screenshot 1](https://raw.githubusercontent.com/5umitpandey/IVP_CodeRush_Hackathon/main/Screenshot1.png)
![Screenshot 2](https://raw.githubusercontent.com/5umitpandey/IVP_CodeRush_Hackathon/main/Screenshot2.png)
![Screenshot 3](https://raw.githubusercontent.com/5umitpandey/IVP_CodeRush_Hackathon/main/Screenshot3.png)



## Contributing
- Fork the repo
- Create a feature branch
- Commit changes
- Push to the branch
- Open a pull request

## License
MIT

## Live Demo
A live demo of the application is available at: [Live Demo](https://moodflow-docker-app-latest.onrender.com/)


## Prize!
![Prize](https://raw.githubusercontent.com/5umitpandey/IVP_CodeRush_Hackathon/main/IVP_Prize_C.JPG)
