import * as Location from 'expo-location';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCpWvAsacLbMWMiwfAU5RbIVMUkKh-5KgI';

// Initialize location permissions
export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            console.log('✅ Location permission granted');
            return true;
        } else {
            console.error('❌ Location permission denied');
            return false;
        }
    } catch (error) {
        console.error('❌ Error requesting location permission:', error.message);
        return false;
    }
};

// Get current location
export const getCurrentLocation = async () => {
    try {
        const permission = await requestLocationPermission();
        if (!permission) return null;

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        console.log('📍 Current location:', latitude, longitude);

        return { latitude, longitude };
    } catch (error) {
        console.error('❌ Error getting current location:', error.message);
        return null;
    }
};

// Get reverse geocoding (coordinates to address)
export const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const result = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        if (result.length > 0) {
            const address = result[0];
            return {
                address: `${address.street}, ${address.city}, ${address.region}`,
                city: address.city,
                region: address.region,
                country: address.country,
            };
        }
        return null;
    } catch (error) {
        console.error('❌ Error reverse geocoding:', error.message);
        return null;
    }
};

// Get geocoding (address to coordinates)
export const getCoordinatesFromAddress = async (address) => {
    try {
        const result = await Location.geocodeAsync(address);

        if (result.length > 0) {
            const { latitude, longitude } = result[0];
            console.log('📍 Geocoded coordinates:', latitude, longitude);
            return { latitude, longitude };
        }
        return null;
    } catch (error) {
        console.error('❌ Error geocoding address:', error.message);
        return null;
    }
};

// Calculate distance between two coordinates (in km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
};

// Get directions between two points (returns URL for Google Maps Directions API)
export const getDirectionsURL = (startLat, startLon, endLat, endLon) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLon}&destination=${endLat},${endLon}&key=${GOOGLE_MAPS_API_KEY}`;
};

// Get map static image URL for preview
export const getMapStaticImageURL = (latitude, longitude, zoom = 15, width = 400, height = 300) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
};

// Search nearby places (parks, gyms, etc.)
export const getNearbyPlaces = async (latitude, longitude, placeType = 'gym', radius = 1000) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&key=${GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results.map((place) => ({
                name: place.name,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
                rating: place.rating,
                address: place.vicinity,
                distance: calculateDistance(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng),
            }));
        }
        return [];
    } catch (error) {
        console.error('❌ Error searching nearby places:', error.message);
        return null;
    }
};
