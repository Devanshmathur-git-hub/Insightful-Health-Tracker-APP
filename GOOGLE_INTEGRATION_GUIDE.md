# Google Fit & Google Maps Integration Guide

## Overview
This health tracker app now includes:
- **Google Fit Integration**: Auto-sync steps, calories, and distance from Google Fit
- **Google Maps Integration**: GPS-based activity tracking with location services

## Features

### Google Fit Integration
- ✅ Automatic step counting sync
- ✅ Calories burned tracking
- ✅ Distance traveled monitoring
- ✅ 30-day step history
- ✅ Real-time health metrics

### Google Maps Integration
- 🗺️ GPS-based activity tracking
- 📍 Location-aware gym/facility finder
- 🏃 Route visualization
- 📊 Distance calculation
- 🎯 Activity endpoint mapping

## Setup Instructions

### Prerequisites
- React Native 0.83+
- Expo 55.0+
- Android SDK 28+ / iOS 14+
- Google Account

### Installation Steps

#### 1. **Google Maps API Key Configuration**
The app comes with a pre-configured Google Maps API key:
```
AIzaSyCpWvAsacLbMWMiwfAU5RbIVMUkKh-5KgI
```

The key is already configured in:
- `app.json` (extra.googleMapsApiKey)
- `src/services/googleMapsService.js`

#### 2. **Android Setup**

Add Google Play Services to `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.14'
    }
}
```

Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-maps:18.2.0'
    implementation 'com.google.android.gms:play-services-location:21.0.1'
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
}
```

#### 3. **iOS Setup**

Add to `ios/Podfile`:
```ruby
pod 'GoogleMaps'
pod 'google-maps-ios-utils'
```

Add to `ios/[ProjectName]/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app tracks your location for activity monitoring.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs access to your location for GPS-based activity tracking.</string>
<key>HealthKitUsageDescription</key>
<string>This app reads your fitness data from Apple Health to sync steps and workouts.</string>
```

#### 4. **Permissions Required**

**Android Permissions** (auto-configured in app.json):
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.INTERNET`
- `com.google.android.gms.permission.ACTIVITY_RECOGNITION`

**iOS Permissions**:
- Location - When In Use
- Location - Always and When In Use
- HealthKit Access

## Usage

### Activity Logging Screen

#### Manual Log Mode
1. Navigate to "Log Screen" → "🏃 Activity" tab
2. Click "📊 Sync with Google Fit" to auto-fetch today's data
3. Or manually enter steps, calories, distance, and duration
4. Select activity type (running, walking, cycling, etc.)
5. Click "Log Activity"

#### GPS Tracking Mode
1. Navigate to "Activity Tracker Screen"
2. Click "🗺️ GPS Track" tab
3. Click "🎯 Start Tracking" to begin
4. Walk/run your activity route
5. Click "🏁 End Tracking" to finish
6. Fill in remaining details (activity type, duration)
7. Click "💾 Save Activity"

### Features Breakdown

#### Google Fit Service (`googleFitService.js`)
```javascript
// Initialize permissions
await initializeGoogleFit();

// Get today's steps
const steps = await getTodaysSteps();

// Get today's calories
const calories = await getTodaysCalories();

// Get today's distance
const distance = await getTodaysDistance();

// Get 30-day history
const history = await get30DaySteps();

// Get range-based data
const data = await getStepsByDateRange(startDate, endDate);
```

#### Google Maps Service (`googleMapsService.js`)
```javascript
// Get current location
const location = await getCurrentLocation();

// Calculate distance between coordinates
const dist = calculateDistance(lat1, lon1, lat2, lon2);

// Find nearby gyms
const gyms = await getNearbyPlaces(lat, lon, 'gym', 2000);

// Get address from coordinates
const address = await getAddressFromCoordinates(lat, lon);

// Get coordinates from address
const coords = await getCoordinatesFromAddress('address');

// Get directions
const url = getDirectionsURL(lat1, lon1, lat2, lon2);
```

#### Map Component (`MapComponent.js`)
- Real-time location marker
- Nearby gyms/facilities display
- Accuracy circle visualization
- Tap to select locations

## Components Overview

### Files Added/Modified

**New Services:**
- `src/services/googleFitService.js` - Google Fit API integration
- `src/services/googleMapsService.js` - Google Maps API integration

**New Components:**
- `src/components/MapComponent.js` - Reusable map component

**New Screens:**
- `src/screens/main/ActivityTrackerScreen.js` - Advanced activity tracking

**Configuration:**
- `src/config/googleConfig.js` - API keys and settings

**Updated Files:**
- `app.json` - Permissions and API key configuration
- `src/screens/main/LogScreen.js` - Google Fit sync button added

## Troubleshooting

### "Google Fit not available" Error
**Solution:**
1. Check Android device has Google Play Services installed
2. Grant location and health permissions in device settings
3. Ensure Google Fit app is installed on the device
4. Restart the app

### Map not showing
**Solution:**
1. Verify Google Maps API key is valid
2. Check location permissions are granted
3. Ensure device has internet connection
4. Restart Expo server with `expo start --clear`

### Location not updating
**Solution:**
1. Enable high-accuracy location mode in device settings
2. Check permission grant: Settings → Apps → Health Tracker → Permissions
3. Toggle location off and on
4. Check system clock is correct

### "API key invalid" Error
**Solution:**
1. Verify API key: `AIzaSyCpWvAsacLbMWMiwfAU5RbIVMUkKh-5KgI`
2. Check Google Cloud Console has Maps/Fitness APIs enabled
3. Verify billing is enabled
4. Check API key restrictions

## Environment Variables

Add to `.env` if needed:
```
GOOGLE_MAPS_API_KEY=AIzaSyCpWvAsacLbMWMiwfAU5RbIVMUkKh-5KgI
GOOGLE_FIT_SCOPE=https://www.googleapis.com/auth/fitness.activity.read
```

## Security Notes

⚠️ **Important**: The API key is currently public in the codebase. For production:
1. Implement backend API gateway
2. Proxy all Google API requests through your server
3. Use API key restrictions by IP and HTTP Referrer
4. Rotate keys regularly
5. Monitor usage in Google Cloud Console

## Performance Tips

1. **Battery Optimization**:
   - Use foreground location updates only
   - Implement battery level checks
   - Cache location queries

2. **Network Optimization**:
   - Batch API requests
   - Implement offline mode
   - Cache maps locally

3. **Accuracy**:
   - Use high-accuracy mode for tracking
   - Filter location outliers
   - Validate distance calculations

## Support & Documentation

- **Google Maps**: https://developers.google.com/maps
- **Google Fit**: https://developers.google.com/fit
- **React Native Maps**: https://github.com/react-native-maps/react-native-maps
- **Expo Location**: https://docs.expo.dev/versions/latest/sdk/location/

## Version Info

- Google Fit: `react-native-google-fit@latest`
- Google Maps: `react-native-maps@latest`
- Expo Location: `expo-location@latest`
- Minimum iOS: 14.0
- Minimum Android: API 28
