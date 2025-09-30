# MS Companion - Health Monitoring Application

## Overview

MS Companion is a health monitoring application designed for Multiple Sclerosis (MS) patients. The application enables users to track daily health metrics, receive AI-powered risk assessments for potential MS relapses, and visualize health trends over time. The system combines user-reported health data with machine learning predictions to provide personalized health insights and recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (September 30, 2025)

**React Native Mobile App**
- Created separate mobile app in `mobile/` directory using Expo and React Native
- Implemented complete mobile UI with 4 main screens matching user mockups:
  - Dashboard: Risk score circle, category badge, personalized health suggestions
  - Input: Health metrics form with emoji mood selector (5 emojis)
  - Trends: 7-day risk visualization chart
  - Settings: AI chat interface with Gemini, demo features, logout
- Built bottom tab navigation for easy mobile navigation
- Integrated Firebase Authentication for email/password auth
- Connected to existing Express backend API endpoints
- Mobile app ready for testing (requires `npm install` in mobile/ directory)

**Gemini AI Integration**
- Added Google Gemini AI as adaptive health companion
- Chat endpoint with conversation history stored in PostgreSQL
- AI provides personalized health advice based on user's health metrics
- Context-aware conversations with user health data integration

**Authentication Migration**
- Switched from Supabase to Firebase Authentication for simpler setup and portability
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
- ✅ 7-day trend visualization
- ✅ Database persistence with PostgreSQL
- ✅ Gemini AI health companion with chat interface
- ✅ React Native mobile app with bottom navigation
- ✅ Complete mobile UI matching mockups

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