# MS Companion - Health Monitoring Application

## Overview

MS Companion is a health monitoring application designed for Multiple Sclerosis (MS) patients. The application enables users to track daily health metrics, receive AI-powered risk assessments for potential MS relapses, and visualize health trends over time. The system combines user-reported health data with machine learning predictions to provide personalized health insights and recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 1, 2025 - Progressive Web App (PWA) Implementation**
- Converted web application to a full Progressive Web App for mobile installation
- Added PWA manifest.json with app metadata and icons
- Implemented service worker for offline functionality and secure caching:
  - Excludes all /api routes and authenticated requests from cache
  - Only caches GET requests for static assets
  - Network-first strategy for API calls to prevent stale health data
  - Offline fallback for better user experience
- Created install prompt component for guided PWA installation
- Added comprehensive PWA meta tags for mobile optimization and SEO
- Icons available in SVG format (Android/modern browsers fully supported)
- Service worker registered on app load for automatic updates
- PWA can be installed on mobile devices and works like a native app

**September 30, 2025 - Flutter Mobile App**
- Created separate mobile app in `flutter/` directory using Flutter/Dart
- Implemented complete mobile UI with 4 main screens matching user mockups:
  - Dashboard: Risk score circle with pull-to-refresh, category badge, personalized health suggestions
  - Input: Health metrics form with 5-emoji mood selector (😢😕😐😊😄)
  - Trends: 7-day risk visualization with fl_chart line graph
  - Settings: AI chat interface with Gemini, bubble messages, logout
- Built bottom navigation bar for easy mobile navigation
- Integrated Firebase Authentication with Provider state management
- Connected to existing Express backend API endpoints
- Material Design 3 with blue theme (#4A90E2) matching mockups
- Mobile app ready for local development (requires Flutter SDK and Firebase setup)

**Gemini AI Integration**
- Added Google Gemini AI as adaptive health companion
- Chat endpoint with conversation history stored in PostgreSQL
- AI provides personalized health advice based on user's health metrics
- Context-aware conversations with user health data integration

**Authentication Migration**
- Setup Firebase Authentication for simpler setup and portability
- Implemented email/password authentication (no third-party OAuth)
- Firebase UID used as primary user identifier in database
- Authentication state managed through React Context API (web) and navigation (mobile)

**Environment Variables Required**
- `DATABASE_URL` - PostgreSQL connection string
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `GEMINI_API_KEY` - Google Gemini API key for AI chat
- `SESSION_SECRET` - Express session secret

**Current MVP Status**
- ✅ User authentication (signup, login, logout) with Firebase
- ✅ Health metrics input interface (5 parameters)
- ✅ ML-based risk prediction using Random Forest
- ✅ Risk assessment display with color-coded categories
- ✅ Personalized health suggestions
- ✅ 7-day trend visualization with interactive charts
- ✅ Database persistence with PostgreSQL
- ✅ Gemini AI health companion with chat interface
- ✅ Flutter mobile app with bottom navigation
- ✅ Complete mobile UI matching mockups
- ✅ Progressive Web App (PWA) with offline support
- ✅ Mobile-installable web app with service worker
- ✅ Portable local development setup

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast compilation and hot module replacement
- Wouter for lightweight client-side routing (alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundation
- shadcn/ui component library (New York style variant) built on top of Radix UI
- Tailwind CSS for utility-first styling with CSS custom properties for theming
- Class Variance Authority (CVA) for managing component variants

**State & Data Management**
- React Query handles all server state with optimistic updates and cache invalidation
- Local component state with React hooks for UI interactions
- Context API for authentication state (Firebase Auth)

**Design Decisions**
- Chose Radix UI for its accessibility-first approach and headless component pattern, allowing full design control
- Selected TanStack Query to eliminate manual loading/error state management and provide automatic cache invalidation
- Implemented utility-first CSS with Tailwind to maintain consistency while allowing rapid UI development

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the entire backend
- ESM (ES Modules) for modern JavaScript module system

**API Structure**
- RESTful endpoints under `/api` namespace
- Separation of concerns: routes.ts for endpoint definitions, storage.ts for data access
- Request validation using Zod schemas derived from Drizzle ORM models

**Machine Learning Integration**
- Python-based ML service (ml-service.py) using scikit-learn Random Forest classifier
- Spawned as child process from Node.js server for risk prediction
- Bidirectional communication via stdin/stdout with JSON payloads
- Pre-trained synthetic model for MS relapse prediction based on health metrics

**Design Decisions**
- Separated ML service into Python to leverage scikit-learn ecosystem while maintaining Node.js for API
- Used child process communication pattern to avoid microservice complexity while maintaining language separation
- Implemented Zod schema validation to ensure type safety between client and server

### Data Storage

**Database**
- PostgreSQL as the primary relational database
- Neon serverless Postgres for scalable, serverless deployment
- Drizzle ORM for type-safe database queries and schema management

**Schema Design**
- Users table: Stores Firebase UID, email, and display name
- Health Metrics table: Tracks daily health inputs (sleep quality, duration, fatigue, mood, activity steps)
- Risk Assessments table: Stores ML-generated risk scores with associated health metrics
- Foreign key relationships with cascade deletes for data integrity

**Design Decisions**
- Chose Drizzle ORM for its TypeScript-first approach and lightweight query builder
- Implemented Firebase UID as user identifier to maintain consistency with authentication system
- Separated health metrics and risk assessments to maintain data normalization and enable historical analysis

### External Dependencies

**Authentication & Identity**
- Firebase Authentication for user management and authentication flows
- Email/password authentication strategy
- Firebase client SDK for frontend auth state management

**Database & ORM**
- Neon Serverless PostgreSQL for database hosting
- Drizzle ORM (v0.39.1) with drizzle-kit for migrations
- postgres-js driver for database connectivity

**Machine Learning**
- Python 3 runtime for ML service execution
- scikit-learn for Random Forest classification
- NumPy for numerical operations
- joblib for model persistence

**UI & Visualization**
- Recharts for data visualization and trend charts
- date-fns for date manipulation and formatting
- Lucide React for icon system

**Design Decisions**
- Firebase Authentication chosen for its robust security features and ease of integration
- Neon selected for serverless PostgreSQL to eliminate database management overhead
- Recharts selected for its React-native approach and customization capabilities
- Python ML service maintains independence from Node.js runtime while leveraging established data science libraries

### Development & Build Process

**Development Environment**
- Vite dev server with HMR for frontend development
- tsx for running TypeScript server code directly
- Replit-specific plugins for development banner and error handling

**Build Process**
- Vite builds React frontend to dist/public
- esbuild bundles server code to dist with external packages
- Separate TypeScript compilation check via tsc

**Environment Configuration**
- Environment variables for database connection (DATABASE_URL)
- Firebase configuration via Vite environment variables
- Node.js development/production mode switching

## Setting Up

Follow these steps to get the MS Companion app running locally:

### 1. Clone the Repository

```sh
git clone https://github.com/r-0n/MS-Companion-MVP.git
cd MS-Companion-MVP
```

### 2. Install Dependencies

Install dependencies for both the server and client:

```sh
# Install server dependencies
npm install


# (Optional) Install Flutter dependencies for mobile app
cd ../flutter
flutter pub get
```
### 3. Set Up Firebase Authentication
Go to [Firebase Console](https://firebase.google.com/)
Create a new project (or use existing one)
Enable Authentication → Email/Password sign-in method
Go to Project Settings and Get your:
API Key
Project ID
App ID

### 4. Set Up Google Gemini AI (Free)
Go to Google AI Studio
Click "Get API key"
Copy your free Gemini API key

### 5. Set Up PostgreSQL Database
Option A: Cloud Database (Easiest) (What I'm using)

Go to [Neon.tech](https://neon.tech/) and sign up (free)
Create a new database
Copy the connection string (looks like: postgresql://user:pass@host/dbname)


### 3. Configure Environment Variables

Create a `.env` file in the project root  with the following variables:

```
# Database
DATABASE_URL=postgresql://your-connection-string-here

# Firebase (from step 3)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id

# Google Gemini AI (from step 4)
GEMINI_API_KEY=your-gemini-api-key

# Session Secret (generate any random string)
SESSION_SECRET=your-random-secret-key-here
```

> **Note:** Never commit your `.env` files to version control.

### Set Up Database Schema
npm run db:push


### 5. Start the development Server

From the project root:

```sh
npm run dev
```

This starts the Express API server with hot-reloading.

### 6. Start the Frontend (Web App)

In a new terminal, from the `client` directory:

```sh
cd client
npm run dev
```

This starts the Vite development server for the React frontend.

### 7. (Optional) Start the Flutter Mobile App

If you want to run the mobile app:

```sh
cd flutter
flutter run
```

### 8. Access the App

- Web app: [http://localhost:5000]
- Mobile app: Run on your emulator or device

---

**Troubleshooting:**  
- Ensure all environment variables are set.
- Check database connectivity.
- For ML features, ensure Python 3 and required packages are installed.









  
