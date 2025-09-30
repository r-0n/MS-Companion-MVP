# Quick Start Guide - MS Companion Flutter App

Get up and running in 5 minutes!

## Prerequisites

✅ Flutter SDK installed ([Download](https://docs.flutter.dev/get-started/install))
✅ Firebase account ([Sign up](https://console.firebase.google.com))
✅ Backend server running (Express API)

## Installation Steps

### Step 1: Clone and Install

```bash
cd flutter
flutter pub get
```

### Step 2: Firebase Setup

**Quick method using FlutterFire CLI:**

```bash
# Install FlutterFire CLI (one-time)
dart pub global activate flutterfire_cli

# Configure Firebase (creates firebase_options.dart automatically)
flutterfire configure
```

Select your Firebase project or create a new one when prompted.

**Enable Email/Password Authentication:**
1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to your project → Authentication → Sign-in method
3. Enable "Email/Password" provider
4. Click Save

### Step 3: Configure Backend URL

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:

```env
API_URL=https://your-backend-url.com
```

If testing locally, use your computer's IP address:
```env
API_URL=http://192.168.1.100:5000
```

### Step 4: Run the App

```bash
flutter run --dart-define-from-file=.env
```

That's it! 🎉

## What You Get

📊 **Dashboard** - View your MS risk score and personalized health suggestions
➕ **Input** - Log daily health metrics (sleep, mood, activity, fatigue)
📈 **Trends** - Visualize 7-day risk score patterns
🤖 **AI Chat** - Talk to your AI health companion powered by Gemini

## Quick Tips

- **Hot Reload**: Press `r` in terminal after making changes
- **Clear Cache**: Run `flutter clean` if you encounter build issues
- **View Logs**: Use `flutter logs` to see console output
- **Physical Device**: Enable Developer Mode and connect via USB

## Need Help?

Check the full [README.md](README.md) for detailed documentation and troubleshooting.

---

Happy coding! 🚀
