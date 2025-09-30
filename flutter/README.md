# MS Companion Flutter App

A Flutter mobile application for MS health tracking with AI-powered insights.

## Features

✅ **Firebase Authentication** - Email/password signup and login
✅ **Health Metrics Tracking** - Input sleep, mood, activity, and fatigue data
✅ **AI Risk Prediction** - ML-based MS relapse risk assessment  
✅ **7-Day Trend Visualization** - Track your health patterns over time
✅ **AI Health Companion** - Chat with Gemini AI for personalized health advice
✅ **Bottom Navigation** - Easy mobile navigation between features

## Prerequisites

Before you begin, ensure you have:

- **Flutter SDK** installed (3.0.0 or higher)
  - [Install Flutter](https://docs.flutter.dev/get-started/install)
  - Run `flutter doctor` to verify installation
- **Android Studio** or **Xcode** for running on emulators/simulators
- **Firebase project** set up at [Firebase Console](https://console.firebase.google.com)

## Setup Instructions

### 1. Install Flutter Dependencies

```bash
cd flutter
flutter pub get
```

### 2. Set Up Firebase

#### Option A: Using FlutterFire CLI (Recommended)

```bash
# Install FlutterFire CLI
dart pub global activate flutterfire_cli

# Configure Firebase for your project
flutterfire configure
```

This will automatically create `firebase_options.dart` with your Firebase configuration.

#### Option B: Manual Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Add Android and iOS apps to your Firebase project
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
4. Place them in the correct directories:
   - Android: `flutter/android/app/google-services.json`
   - iOS: `flutter/ios/Runner/GoogleService-Info.plist`
5. Update `lib/firebase_options.dart` with your Firebase configuration

### 3. Enable Firebase Authentication

1. Go to Firebase Console → Authentication
2. Click "Get Started"
3. Enable **Email/Password** sign-in method
4. Save changes

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Your Express backend URL (from Replit or local)
API_URL=https://your-repl-name.repl.co

# Firebase credentials from Firebase Console
FIREBASE_API_KEY=your_api_key
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 5. Run the App

#### On Android Emulator:

```bash
flutter run --dart-define-from-file=.env
```

#### On iOS Simulator:

```bash
flutter run --dart-define-from-file=.env
```

#### On Physical Device:

1. Enable Developer Mode on your device
2. Connect via USB
3. Run: `flutter run --dart-define-from-file=.env`

## Project Structure

```
flutter/
├── lib/
│   ├── main.dart                   # App entry point
│   ├── firebase_options.dart       # Firebase configuration
│   ├── screens/
│   │   ├── auth_screen.dart       # Login/Signup
│   │   ├── home_screen.dart       # Bottom navigation container
│   │   ├── dashboard_screen.dart  # Risk score dashboard
│   │   ├── input_screen.dart      # Health metrics input
│   │   ├── trends_screen.dart     # 7-day trends chart
│   │   └── settings_screen.dart   # AI chat & settings
│   └── services/
│       ├── auth_service.dart      # Firebase authentication
│       └── api_service.dart       # Backend API client
├── pubspec.yaml                    # Dependencies
└── README.md                       # This file
```

## Backend API

This Flutter app connects to the Express backend API. Ensure your backend is running and accessible.

### Required Backend Endpoints:

- `POST /api/predict-risk` - Submit health metrics and get risk prediction
- `GET /api/risk-history/:userId` - Get 7-day risk history
- `GET /api/latest-risk/:userId` - Get latest risk assessment
- `POST /api/chat` - Send message to AI health companion
- `GET /api/chat/history/:userId` - Get chat history
- `POST /api/users` - Create user account

## Development

### Hot Reload

Flutter supports hot reload during development:
- Press `r` in terminal to hot reload
- Press `R` to hot restart

### Debugging

```bash
# Run with debugging enabled
flutter run --debug --dart-define-from-file=.env

# View logs
flutter logs
```

### Build Release Version

#### Android APK:

```bash
flutter build apk --release --dart-define-from-file=.env
```

Output: `build/app/outputs/flutter-apk/app-release.apk`

#### iOS IPA:

```bash
flutter build ios --release --dart-define-from-file=.env
```

## Troubleshooting

### Firebase Authentication Issues

**Error: Firebase not initialized**
- Ensure `firebase_options.dart` is properly configured
- Run `flutterfire configure` to regenerate configuration

**Error: Email/Password sign-in not enabled**
- Go to Firebase Console → Authentication → Sign-in method
- Enable Email/Password provider

### Backend Connection Issues

**Error: Connection refused**
- Check that `API_URL` in `.env` is correct
- Ensure backend server is running
- If testing locally, use your computer's IP address instead of `localhost`
  - Example: `http://192.168.1.100:5000`

### Build Issues

**Error: Dependency resolution failed**
```bash
flutter clean
flutter pub get
```

**Error: Android build failed**
- Ensure Android SDK is installed
- Update `android/app/build.gradle` if needed
- Check `minSdkVersion` is at least 21

**Error: iOS build failed**
- Ensure Xcode is installed (macOS only)
- Run `pod install` in `ios/` directory
- Update CocoaPods: `sudo gem install cocoapods`

## Tech Stack

- **Flutter** - UI framework
- **Firebase Auth** - Authentication
- **Provider** - State management
- **fl_chart** - Charts and graphs
- **http** - API client
- **google_fonts** - Typography

## License

This project is part of the MS Companion health tracking system.
