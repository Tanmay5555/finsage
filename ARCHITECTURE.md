# Finsage AI — System Architecture & Data-Flow Documentation (Archify)

## Overview
**Finsage AI** is an intelligent personal finance copilot built with **Next.js 16 (App Router)**, **Firebase (Auth & Firestore)**, **Google Gemini 2.5 AI**, **Google Cloud Vision OCR**, and a **Dynamic Time & Festival Theme Engine**.

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
  User[User Browser / Client] --> NextApp[Next.js 16 App Router]

  subgraph Client Layer
    NextApp --> AuthCtx[AuthProvider - Firebase Auth]
    NextApp --> ThemeCtx[ThemeContext - Dynamic Theme Engine]
    NextApp --> CurrencyCtx[CurrencyContext - Multi-Currency]
  end

  subgraph UI Components
    NextApp --> Dashboard[Dashboard & Metrics]
    NextApp --> Goals[Savings Goals & AI Planner]
    NextApp --> Upload[Bank Statement / Receipt Upload]
    NextApp --> Settings[Settings & Theme Studio]
  end

  subgraph Next.js API Layer
    Dashboard & Goals --> APIInsight[/api/insight - Gemini AI]
    Upload --> APIExtract[/api/amount-extract - Cloud Vision OCR]
    Upload --> APIFile[/api/file-transaction - PDF Parser]
    Dashboard --> APIStats[/api/stats/summary - Metrics Aggregator]
  end

  subgraph Cloud & Database
    AuthCtx --> FirebaseAuth[Firebase Authentication]
    APIStats & Goals & Dashboard --> Firestore[Cloud Firestore DB]
    APIExtract --> CloudVision[Google Cloud Vision API]
    APIInsight --> Gemini[Google Gemini 2.5 Flash]
  end
```

---

## 🎨 Dynamic Theme Architecture

The theme system automatically computes layout background gradients, glowing ambient lighting, and particle micro-animations based on **Time of Day** and **Calendar Festivals**:

1. **Time-Based Preset Engine (`src/lib/themes.js`)**:
   - **Morning Sunrise** (06:00 - 11:59): Amber & golden sunrise rays.
   - **Day Breeze** (12:00 - 16:59): Sky blue & emerald green.
   - **Sunset Twilight** (17:00 - 19:59): Coral pink & crimson twilight.
   - **Galactic Midnight** (20:00 - 05:59): Deep obsidian dark mode.

2. **Festival Celebrations (Admin Restricted)**:
   - **Diwali Lights** 🪔: Golden Diyas & warm crimson.
   - **Holi Color Splash** 🎨: Gulal color splash.
   - **Navratri Garba** 💃: Marigold orange & peacock violet.
   - **Christmas & New Year** 🎄: Crimson, Emerald & Snow particles.
   - **Eid Crescent** 🌙: Emerald Green & Crescent Gold.
   - **Patriotic Tricolor** 🇮🇳: Saffron, Pure White & Green.
   - **Spooky Halloween** 🎃: Pumpkin Orange & Spooky Purple.

3. **Admin Guard (`ThemeContext.jsx`)**:
   - Standard users automatically receive **Time-based themes**.
   - Festival themes and Auto-Festival mode are restricted to authorized Admin accounts (`NEXT_PUBLIC_ADMIN_EMAILS`).

---

## 📁 Key File Map

| Subsystem | File Path | Description |
| :--- | :--- | :--- |
| **Archify Map** | [`archify.html`](file:///d:/Finsage/archify.html) | Standalone interactive visual topology visualizer |
| **Archify Skill** | [`.agents/skills/archify/SKILL.md`](file:///d:/Finsage/.agents/skills/archify/SKILL.md) | Agent skill definition |
| **Theme Registry** | [`src/lib/themes.js`](file:///d:/Finsage/src/lib/themes.js) | Preset colors, particles, date/time detectors |
| **Theme Provider** | [`src/context/ThemeContext.jsx`](file:///d:/Finsage/src/context/ThemeContext.jsx) | Theme state provider & admin security guard |
| **Theme Particles** | [`src/components/ui/ThemeParticles.jsx`](file:///d:/Finsage/src/components/ui/ThemeParticles.jsx) | Framer Motion floating particles component |
| **Theme Popover** | [`src/components/ui/ThemeSelectorWidget.jsx`](file:///d:/Finsage/src/components/ui/ThemeSelectorWidget.jsx) | Header popover widget with Admin lock badges |
| **Auth Provider** | [`src/context/AuthContext.jsx`](file:///d:/Finsage/src/context/AuthContext.jsx) | Auth listener & admin role evaluation |
| **Firebase Handle** | [`src/lib/firebase.js`](file:///d:/Finsage/src/lib/firebase.js) | Firebase app, auth, db & storage singleton |
