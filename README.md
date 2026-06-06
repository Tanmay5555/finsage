# 🌐 Finsage — Premium AI-Powered Personal Finance Dashboard

Finsage is a modern, premium personal finance assistant and tracking dashboard designed to help users take control of their financial health. Built using Next.js (App Router), Tailwind CSS, and Firebase, Finsage integrates advanced data visualization with cutting-edge AI insights. 

Using Google's **Gemini 2.5 Flash API**, Finsage automatically extracts transaction data from receipts, statements, and invoices, and provides intelligent monthly financial summaries and tips.

---

## 🚀 Key Features

*   📊 **Comprehensive Analytics Dashboard**: Track total balance, net income, expenses, and savings rates with interactive charting.
*   🧠 **AI Financial Advisor**: Receive personalized, context-aware insights on income, spending, and tips to improve savings, processed directly by Gemini.
*   🧾 **AI Receipt OCR & File Import**: Upload PDFs, CSVs, or Excel sheets. Finsage uses Gemini's multi-modal capabilities to instantly parse transaction amounts, dates, and vendors.
*   📈 **Stunning Visualizations**: Interactive Recharts components including savings trend area charts, income vs. expense comparison bar charts, and category-wise spending breakdown donut charts.
*   🔐 **Secure Authentication**: User sign-up, login, and secure session management via Firebase Authentication.
*   📁 **Cloud-Synced Database**: Instant updates and real-time document storage using Firebase Firestore.
*   ✨ **Premium UI/UX**: Clean dark-mode card aesthetics combined with interactive animations, Lucide React icons, and custom layout frameworks.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15+ (App Router, JavaScript)
*   **Styling**: Tailwind CSS, shadcn/ui components, custom HSL color palette
*   **Data Visualization**: Recharts
*   **Auth & Database**: Firebase Auth + Firebase Firestore
*   **AI/OCR Integration**: Google Gemini API (`@google/generative-ai` with `gemini-2.5-flash`)
*   **File Parsers**: `formidable` (multi-part forms), `pdf-parse` (PDF text extraction), `xlsx` (Excel/CSV sheets parser)

---

## 📂 Project Structure

```bash
Finsage/
├── public/                 # Static assets (icons, images)
├── src/
│   ├── app/                # Next.js App Router (pages and API endpoints)
│   │   ├── account/        # User Profile Management
│   │   ├── api/            # Serverless API routes (AI & Parsing endpoints)
│   │   │   ├── amount-extract     # AI amount extraction from uploads
│   │   │   ├── file-transaction   # Bulk document parsing & categorization
│   │   │   ├── insight            # Monthly Gemini insight generation
│   │   │   └── stats              # Financial analytics calculation APIs
│   │   ├── dashboard/      # Main application workspace
│   │   ├── expense/        # Expense tracking & logs
│   │   ├── income/         # Income tracking & logs
│   │   ├── settings/       # App preferences
│   │   ├── statistics/     # Advanced graphs and charts
│   │   └── upload-transactions # OCR Document uploads
│   ├── components/         # Reusable UI & Dashboard components
│   │   ├── dashboard/      # Specific cards, tables, and charts
│   │   ├── expense/        # Add-expense forms and list components
│   │   ├── income/         # Add-income forms and list components
│   │   ├── layouts/        # Shared application layouts
│   │   ├── magicui/        # Custom interactive animations
│   │   └── ui/             # shadcn core atomic components
│   ├── context/            # AuthContext & global states
│   └── lib/                # Utility helpers (Gemini integrations, db config)
```

---

## ⚙️ Configuration & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or higher recommended).

### 2. Environment Variables
Create a `.env.local` file in the root directory and add the following credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/varshneytanmay75/Finsage.git
cd Finsage
npm install
```

### 4. Running Locally
Start the development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 👨‍💻 Developer & License

*   **Author**: Tanmay Gupta
*   **Email**: varshneytanmay75@gmail.com
*   **License**: Licensed under the [MIT License](LICENSE).
