import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, FlatList, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
const API_URL = "https://c54e-91-186-230-143.ngrok-free.app";

const COLORS = {
  primary: '#2F80ED',
  success: '#27AE60',
  error: '#EB5757',
  background: '#F8F9FA',
  text: '#2D3436',
  skeleton: '#E0E0E0',
};

const getCacheKey = (lat, lon) => `ROUTE_CACHE_${lat}_${lon}`;
const STATION_DATA_EXPIRY = 24 * 60 * 60 * 1000; // 24h (station names/coordinates)
const ROUTING_DATA_EXPIRY = 15 * 60 * 1000; // 15m (distances/times from API)


const saveUserToken = async (token) => {
  try {
    // Use "authToken" to match your SignIn screen
    await AsyncStorage.setItem('authToken', token);
    setUserToken(token);
  } catch (error) {
    console.error('Error saving user token:', error);
  }
};

const ClosestBusStation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [region, setRegion] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
   const [userToken, setUserToken] = useState(null);

   const getUserToken = async () => {
    try {
      // Use "authToken" to match your SignIn screen
      const token = await AsyncStorage.getItem('authToken');
      setUserToken(token);
      return token;
    } catch (error) {
      console.error('Error retrieving user token:', error);
      return null;
    }
  };

 const cleanExpiredCache = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    const expiredKeys = await Promise.all(
      allKeys.map(async (key) => {
        if (!key.startsWith('ROUTE_CACHE')) return null;
        const cachedData = await AsyncStorage.getItem(key);
        const { timestamp } = JSON.parse(cachedData);
        return Date.now() - timestamp > ROUTING_DATA_EXPIRY ? key : null;
      })
    );
    await AsyncStorage.multiRemove(expiredKeys.filter(Boolean));
  };

  // Caching functions
  const getCachedData = async (lat,lon) => {
    try {
      const CACHE_KEY = getCacheKey(lat, lon);
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;
      
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < ROUTING_DATA_EXPIRY) {
        return data;
      }
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  };

  const cacheData = async (data, lat, lon) => {
    try {
      const CACHE_KEY = getCacheKey(lat, lon);
      const cache = {
        timestamp: Date.now(),
        data: data
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      await cleanExpiredCache();
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

  const fetchNearbyStations = async (latitude, longitude) => {
    try {
       const token = await getUserToken();
        if (!token) {
      setErrorMsg('Authentication required. Please sign in again.');
      setStatus('error');
      return;
    }
      const cached = await getCachedData(latitude, longitude);
      if (cached) {
        setNearbyStations(cached);
        setIsCached(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        return;
      }

      const url = new URL(`${API_URL}/closest-station/find`);
      url.searchParams.append('lat', latitude);
      url.searchParams.append('lon', longitude);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`
        }
      });
       if (response.status === 401) {
      setErrorMsg('Your session has expired. Please sign in again.');
      setStatus('error');
      return;
    }

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setNearbyStations(data);
      await cacheData(data.stations, latitude, longitude);
      setIsCached(false);
      calculateMapRegion(latitude, longitude);
      setStatus('success');

    } catch (error) {
      setErrorMsg(error.message || 'Failed to fetch stations');
      setStatus('error');
    }
  };

  const calculateMapRegion = (userLat, userLon) => {
    setRegion({
      latitude: userLat,
      longitude: userLon,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    });
  };

   const handleRefresh = async () => {
    setStatus('loading');
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      await fetchNearbyStations(latitude, longitude);
    } catch (error) {
      setErrorMsg('Failed to refresh location. Please try again.');
      setStatus('error');
    }
  };
  

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      handleRefresh();
    } else {
      setErrorMsg('Location permission is required to find nearby stations.');
      setStatus('error');
    }
  };

  useEffect(() => {
    (async () => {
      await getUserToken();
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        handleRefresh();
      } else {
        setStatus('permission-required');
      }
    })();
  }, []);

  // Skeleton Loading Component
  const SkeletonItem = () => (
    <Animated.View style={[styles.stationCard, { opacity: fadeAnim }]}>
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonCircle, { backgroundColor: COLORS.skeleton }]} />
        <View style={[styles.skeletonText, { backgroundColor: COLORS.skeleton }]} />
      </View>
      <View style={styles.skeletonDetails}>
        <View style={[styles.skeletonLine, { backgroundColor: COLORS.skeleton }]} />
        <View style={[styles.skeletonButton, { backgroundColor: COLORS.skeleton }]} />
      </View>
    </Animated.View>
  );

  const renderStationItem = ({ item }) => (
    <View style={styles.stationCard}>
      <View style={styles.stationHeader}>
        <MaterialIcons name="directions-bus" size={20} color={COLORS.primary} />
        <Text style={styles.stationName}>{item.station_name}</Text>
      </View>
      <View style={styles.stationDetails}>
      <View style={styles.distanceTimeContainer}>
        <Text style={styles.distanceText}>{item.distance.toFixed(2)} km away</Text>
        <Text style={styles.timeText}>{Math.round(item.time)} mins
        </Text>
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`
          )}
        >
          <MaterialCommunityIcons name="directions" size={16} color="white" />
          <Text style={styles.smallButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {isCached ? 'Updating stations...' : 'Finding nearby stations...'}
            </Text>
          </View>
        );

      case 'permission-required':
        return (
          <View style={styles.centered}>
            <MaterialIcons name="location-off" size={60} color={COLORS.text} />
            <Text style={styles.errorText}>Location permission required</Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centered}>
            <MaterialIcons name="error-outline" size={60} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <MaterialCommunityIcons name="reload" size={24} color="white" />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <>
            <MapView style={styles.map} region={region}>
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  pinColor={COLORS.primary}
                />
              )}
              {nearbyStations.map((station, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: station.lat,
                    longitude: station.lon,
                  }}
                  title={station.station_name}
                  description={`${station.distance.toFixed(2)} km away · ${Math.round(station.time)} mins`}
                  pinColor={COLORS.success}
                />
              ))}
            </MapView>

            <BlurView intensity={70} tint="default" style={styles.listContainer}>
              <FlatList
                data={nearbyStations}
                renderItem={isCached ? SkeletonItem : renderStationItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                  <Text style={styles.listHeader}>
                    {isCached ? 'Using Cached Data' : 'Nearby Stations'}
                  </Text>
                }
                ListEmptyComponent={
                  <View style={styles.centered}>
                    <Text style={styles.errorText}>No stations found</Text>
                  </View>
                }
              />
            </BlurView>
          </>
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  listContainer: {
    position: 'absolute',
    bottom: 1,
    left: 1,
    right: 1,
    maxHeight: '45%',
  borderRadius: 24,
  overflow: 'hidden', 
  backgroundColor: 'rgba(255,255,255,0.4)', 
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  listHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 12,
    paddingHorizontal: 16,
    letterSpacing: -0.5,
  },
  stationCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
    letterSpacing: -0.2,
  },
  stationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  distanceTimeContainer: {
    flexDirection: 'column',
  },
  distanceText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginRight: 8,
  },
  timeText: { 
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  directionsButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  permissionButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100, // Above the list
    right: 20,
    backgroundColor: COLORS.primary,
    width: 100,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  skeletonText: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginLeft: 8,
  },
  skeletonDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonLine: {
    height: 14,
    width: '30%',
    borderRadius: 4,
  },
  skeletonButton: {
    width: 80,
    height: 30,
    borderRadius: 6,
  },
});

export default ClosestBusStation;