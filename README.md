# Finsage

A modern personal finance dashboard built with Next.js, Firebase, Tailwind CSS, and AI-powered transaction automation.

## About

Finsage is designed to help users track income, expenses, and financial trends through a clean dashboard, upload-based transaction extraction, and AI-enhanced insights.

## Features

- Income and expense tracking with add, edit, and list views
- AI-assisted amount/category extraction from receipts and statements
- Bulk upload support for CSV/XLS/PDF transaction import
- Dashboard charts for income vs expense, savings trends, and category breakdowns
- Firebase authentication and Firestore-backed data storage
- Responsive layout optimized for desktop and mobile

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** React, Tailwind CSS, shadcn/ui
- **Data Visualization:** Recharts
- **Auth / Database:** Firebase Auth + Firestore
- **AI / OCR:** Google Cloud Vision, Google Gemini
- **File Parsing:** pdf-parse, xlsx

## Quick Start

```bash
git clone https://github.com/JrG-One/Finsage.git
cd Finsage
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env.local` file in the project root with your keys.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CREDENTIALS_JSON=./google-credentials.json
```

## Local Development

1. Install dependencies: `npm install`
2. Create `.env.local` with Firebase and Google credentials
3. Run development server: `npm run dev`
4. Visit: `http://localhost:3000`

## Deployment

This project can be deployed on Vercel, Netlify, or any platform that supports Next.js.

## Repository Structure

- `src/app/` — pages and route handlers
- `src/components/` — reusable UI and dashboard components
- `src/lib/` — utility functions and API helpers
- `src/context/` — auth and app context providers

## GitHub

This repository is configured for GitHub at:

`https://github.com/JrG-One/Finsage`

## License

MIT License
