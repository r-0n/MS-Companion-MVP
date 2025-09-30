# MS Companion Mobile App

React Native mobile application for MS health tracking with AI-powered insights.

## Features

✅ **Firebase Authentication** - Email/password signup and login
✅ **Health Metrics Tracking** - Input sleep, mood, activity, and fatigue data
✅ **AI Risk Prediction** - ML-based MS relapse risk assessment
✅ **7-Day Trend Visualization** - Track your health patterns over time
✅ **AI Health Companion** - Chat with Gemini AI for personalized health advice
✅ **Bottom Tab Navigation** - Easy mobile navigation between features

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed: `npm install -g expo-cli`
- A physical device with Expo Go app OR an iOS/Android emulator

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update the values in `.env`:
- `EXPO_PUBLIC_API_URL` - Your backend API URL (from Replit)
- `EXPO_PUBLIC_FIREBASE_API_KEY` - From Firebase console
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` - From Firebase console
- `EXPO_PUBLIC_FIREBASE_APP_ID` - From Firebase console

### 3. Run the App

```bash
npm start
```

This will start the Expo development server. You can then:

- **On Physical Device**: Scan the QR code with Expo Go app
- **On iOS Simulator**: Press `i` in the terminal
- **On Android Emulator**: Press `a` in the terminal

## Backend API

This mobile app connects to the Express backend API. Make sure your backend is running:

- Backend URL should be accessible from your mobile device
- If testing locally, both backend and mobile device should be on the same network
- Update `EXPO_PUBLIC_API_URL` in `.env` to your backend URL

## Project Structure

```
mobile/
├── App.tsx                      # Main app entry with navigation
├── screens/                     # All app screens
│   ├── AuthScreen.tsx          # Login/Signup
│   ├── DashboardScreen.tsx     # Risk dashboard
│   ├── InputScreen.tsx         # Health metrics input
│   ├── TrendsScreen.tsx        # 7-day trends chart
│   └── SettingsScreen.tsx      # AI chat & settings
├── navigation/                  # Navigation configuration
│   └── BottomTabNavigator.tsx  # Bottom tab navigation
├── lib/                         # Utilities
│   ├── api.ts                  # API client
│   └── firebase.ts             # Firebase configuration
└── package.json                # Dependencies

```

## API Integration

The app consumes these backend endpoints:

- `POST /api/predict-risk` - Submit health metrics and get risk prediction
- `GET /api/risk-history/:userId` - Get 7-day risk history
- `GET /api/latest-risk/:userId` - Get latest risk assessment
- `POST /api/chat` - Send message to AI health companion
- `GET /api/chat/history/:userId` - Get chat history
- `POST /api/users` - Create user account
- `GET /api/users/:uid` - Get user details

## Troubleshooting

### Dependencies not installing
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Can't connect to backend API
- Make sure backend is running
- Check `EXPO_PUBLIC_API_URL` is correct in `.env`
- If testing locally, use your computer's local IP address (not localhost)
- Example: `http://192.168.1.100:5000` instead of `http://localhost:5000`

### Firebase authentication errors
- Verify all Firebase environment variables are set correctly
- Check Firebase console for enabled authentication methods
- Ensure Email/Password authentication is enabled in Firebase

## Development

### Adding New Screens
1. Create screen component in `screens/`
2. Add to navigation in `navigation/BottomTabNavigator.tsx`
3. Update types if using TypeScript

### Modifying API Calls
Update `lib/api.ts` to add or modify API endpoints

### Styling
All styles use React Native's StyleSheet API. Colors and theme are defined inline in each component.

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Firebase** - Authentication
- **Axios** - HTTP client
- **React Native Chart Kit** - Charts and graphs

## License

This project is part of the MS Companion health tracking system.
