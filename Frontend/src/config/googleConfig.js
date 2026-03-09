// Google Maps API Key Configuration
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCpWvAsacLbMWMiwfAU5RbIVMUkKh-5KgI';

// Location settings
export const LOCATION_SETTINGS = {
    accuracy: 'high',
    timeout: 10000,
    enableHighAccuracy: true,
};

// Google Fit settings
export const GOOGLE_FIT_SETTINGS = {
    scopes: [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
    ],
};

// Map settings
export const MAP_SETTINGS = {
    initialZoom: 15,
    nearbySearchRadius: 2000, // meters
    maxNearbyResults: 10,
};

// Activity tracking settings
export const ACTIVITY_TRACKING = {
    minDistanceThreshold: 0.1, // km
    minDurationThreshold: 5, // minutes
    updateInterval: 10000, // milliseconds
};
