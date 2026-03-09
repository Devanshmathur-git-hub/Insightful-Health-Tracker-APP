import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getCurrentLocation, getNearbyPlaces } from '../services/googleMapsService';
import { Colors } from '../theme/colors';

const MapComponent = ({ 
    onLocationSelected, 
    showNearbyGyms = false, 
    initialRegion,
    markerTitle = 'Activity Location'
}) => {
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(initialRegion || null);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [mapRef, setMapRef] = useState(null);

    useEffect(() => {
        initializeMap();
    }, []);

    const initializeMap = async () => {
        try {
            const location = await getCurrentLocation();
            if (location) {
                setCurrentLocation(location);
                onLocationSelected?.(location);

                // Fetch nearby gyms if enabled
                if (showNearbyGyms) {
                    const places = await getNearbyPlaces(
                        location.latitude,
                        location.longitude,
                        'gym',
                        2000 // 2km radius
                    );
                    if (places) {
                        setNearbyPlaces(places);
                    }
                }
            } else {
                Alert.alert('Location Error', 'Unable to fetch your location. Please check permissions.');
            }
        } catch (error) {
            console.error('❌ Map initialization error:', error.message);
            Alert.alert('Error', 'Failed to initialize map');
        } finally {
            setLoading(false);
        }
    };

    const handleMapPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setCurrentLocation({ latitude, longitude });
        onLocationSelected?.({ latitude, longitude });
    };

    const handleMarkerPress = (place) => {
        Alert.alert(
            place.name,
            `Rating: ${place.rating || 'N/A'}\n${place.address}\nDistance: ${place.distance}km`,
            [{ text: 'Close', onPress: () => {} }]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    if (!currentLocation) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Unable to load map</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={setMapRef}
                style={styles.map}
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
            >
                {/* Current location marker */}
                <Marker
                    coordinate={currentLocation}
                    title={markerTitle}
                    description="Tap to select this location"
                    pinColor={Colors.primary}
                />

                {/* Accuracy circle */}
                <Circle
                    center={currentLocation}
                    radius={100}
                    fillColor={`${Colors.primary}20`}
                    strokeColor={Colors.primary}
                    strokeWidth={1}
                />

                {/* Nearby gyms markers */}
                {nearbyPlaces.map((place, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: place.latitude,
                            longitude: place.longitude,
                        }}
                        title={place.name}
                        description={place.address}
                        pinColor={Colors.accentGreen}
                        onPress={() => handleMarkerPress(place)}
                    />
                ))}
            </MapView>

            {/* Info card */}
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>📍 Location Selected</Text>
                <Text style={styles.infoText}>
                    Lat: {currentLocation.latitude.toFixed(4)}
                </Text>
                <Text style={styles.infoText}>
                    Lon: {currentLocation.longitude.toFixed(4)}
                </Text>
                {nearbyPlaces.length > 0 && (
                    <Text style={styles.infoText}>
                        🏋️ {nearbyPlaces.length} nearby gyms
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.7,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: Colors.error,
        textAlign: 'center',
        marginTop: 20,
    },
    infoCard: {
        backgroundColor: Colors.cardBackground,
        padding: 16,
        borderRadius: 12,
        margin: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
});

export default MapComponent;
