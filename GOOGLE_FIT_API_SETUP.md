# Google Fit API Setup Guide

To enable **real Google Fit step tracking** (not device sensors), follow these steps:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"NEW PROJECT"**
3. Enter project name: `Insightful Health Tracker`
4. Click **"CREATE"**

## Step 2: Enable Google Fit API

1. In the Google Cloud Console, search for **"Google Fit API"**
2. Click **"Google Fit API"**
3. Click **"ENABLE"**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"Credentials"** in the left menu
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Android"** or **"iOS"** (depending on your testing device)
4. For **Android**:
   - Package name: `com.healthtracker.app` (from your app.json)
   - SHA-1 certificate fingerprint: Get from running `adb` (see below)
5. For **iOS**:
   - Bundle ID: `com.healthtracker.app`
6. Click **"Create"** and note your **Client ID**

## Step 4: Get Android SHA-1 Fingerprint (if using Android)

Run this command in your project:
```bash
cd Frontend/android && ./gradlew signingReport | grep SHA1
```

Copy the SHA-1 value and paste it in Google Cloud Console.

## Step 5: Add Client ID to Your App

1. Open `Frontend/src/services/googleSignInService.js`
2. Replace this line:
   ```javascript
   const CLIENT_ID = ''; // Replace with your Google Cloud Client ID
   ```
   With your actual Client ID from Google Cloud Console:
   ```javascript
   const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```

## Step 6: Test Google Fit Integration

1. Restart your Expo dev server:
   ```bash
   cd Frontend && npm start
   ```
2. On your phone, tap the **"🔐 Sign In with Google Fit"** button (appears when you reload)
3. Sign in with your Google account
4. Grant permission to access fitness data
5. Your step count will now fetch from Google Fit!

## Troubleshooting

- **"Invalid Client ID"**: Ensure you copied the correct Client ID and it matches your app's package name
- **"Permission Denied"**: Make sure Google Fit is enabled in Google Cloud Console
- **"Invalid Redirect URI"**: This is usually auto-configured by Expo; if not, it will be printed in the dev console

## Benefits of Google Fit API

✅ **Works with Expo** (no native compilation needed)  
✅ **Real Google Fit data** (synced from your Google account)  
✅ **Cross-device sync** (steps synced across all your devices)  
✅ **Historical data** (access 30+ days of history)  
✅ **Better accuracy** (uses Google's server-side data)
