import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { PrayerTimeService } from '../services/PrayerTimeService';
import { LocationService } from '../services/LocationService';
import { NotificationService } from '../services/NotificationService';
import { StorageService } from '../services/StorageService';
import { HijriCalendarUtils } from '../utils/HijriCalendarUtils';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [nextPrayer, setNextPrayer] = useState(null);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [hijriDate, setHijriDate] = useState(null);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Calculate next prayer and time remaining
  useEffect(() => {
    if (prayerTimes && location) {
      const next = PrayerTimeService.getNextPrayer(prayerTimes, currentTime, location);
      const current = PrayerTimeService.getCurrentPrayer(prayerTimes, currentTime);
      const timeRemaining = next ? PrayerTimeService.getTimeUntilNextPrayer(next.time, currentTime) : null;
      
      setNextPrayer(next);
      setCurrentPrayer(current);
      setTimeUntilNext(timeRemaining || { hours: 0, minutes: 0 });
    }
  }, [prayerTimes, location, currentTime]);

  const loadPrayerTimes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Set a default location first (to avoid infinite loading)
      const defaultLocation = {
        latitude: 21.3891, // Mecca coordinates as default
        longitude: 39.8579,
        name: 'Default Location (Mecca)'
      };
      
      // Try to get saved location first
      let userLocation = await StorageService.getUserLocation();
      
      if (!userLocation || !userLocation.latitude) {
        try {
          // Try to get current location (with timeout)
          const locationPromise = LocationService.getCurrentLocation();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location timeout')), 10000)
          );
          
          const currentLocation = await Promise.race([locationPromise, timeoutPromise]);
          const name = await LocationService.getLocationName(
            currentLocation.latitude, 
            currentLocation.longitude
          );
          
          userLocation = {
            ...currentLocation,
            name: name || 'Your Location'
          };
          
          // Save location for future use
          await StorageService.saveUserLocation(userLocation);
        } catch (locationError) {
          console.log('Could not get location, using default:', locationError.message);
          userLocation = defaultLocation;
        }
      }
      
      setLocation(userLocation);
      setLocationName(userLocation.name || 'Unknown Location');
      
      // Calculate prayer times
      const times = PrayerTimeService.calculatePrayerTimes(
        userLocation.latitude,
        userLocation.longitude,
        new Date()
      );
      
      if (times) {
        setPrayerTimes(times);
        await StorageService.saveLastPrayerTimes(times, userLocation);
        
        // Try to schedule notifications (but don't block if it fails)
        try {
          const notificationSettings = await StorageService.getNotificationSettings();
          if (notificationSettings.enabled) {
            await NotificationService.schedulePrayerNotifications(times, userLocation.name);
          }
        } catch (notifError) {
          console.log('Could not schedule notifications:', notifError.message);
        }
      } else {
        throw new Error('Could not calculate prayer times');
      }
      
      // Get Hijri date
      const hijri = HijriCalendarUtils.getHijriDate();
      setHijriDate(hijri);
      
    } catch (error) {
      console.error('Error loading prayer times:', error);
      setError(error.message);
      
      // Still try to show basic UI even if there's an error
      const hijri = HijriCalendarUtils.getHijriDate();
      setHijriDate(hijri);
    } finally {
      setIsLoading(false);
    }
  };
      );
      const timeRemaining = next
        ? PrayerTimeService.getTimeUntilNextPrayer(next.time, currentTime)
        : null;

      setNextPrayer(next);
      setCurrentPrayer(current);
      setTimeUntilNext(timeRemaining || { hours: 0, minutes: 0 });
    }
  }, [prayerTimes, location, currentTime]);

  const loadPrayerTimes = async () => {
    try {
      setIsLoading(true);

      // Try to get saved location first
      let userLocation = await StorageService.getUserLocation();

      if (!userLocation || !userLocation.latitude) {
        // Get current location
        const currentLocation = await LocationService.getCurrentLocation();
        const name = await LocationService.getLocationName(
          currentLocation.latitude,
          currentLocation.longitude
        );

        userLocation = {
          ...currentLocation,
          name,
        };

        // Save location for future use
        await StorageService.saveUserLocation(userLocation);
      }

      setLocation(userLocation);
      setLocationName(userLocation.name || "Unknown Location");

      // Calculate prayer times
      const times = PrayerTimeService.calculatePrayerTimes(
        userLocation.latitude,
        userLocation.longitude,
        new Date()
      );

      if (times) {
        setPrayerTimes(times);
        await StorageService.saveLastPrayerTimes(times, userLocation);

        // Schedule notifications
        const notificationSettings =
          await StorageService.getNotificationSettings();
        if (notificationSettings.enabled) {
          await NotificationService.schedulePrayerNotifications(
            times,
            userLocation.name
          );
        }
      } else {
        Alert.alert(
          "Error",
          "Could not calculate prayer times for your location."
        );
      }

      // Get Hijri date
      const hijri = HijriCalendarUtils.getHijriDate();
      setHijriDate(hijri);
    } catch (error) {
      console.error("Error loading prayer times:", error);
      Alert.alert(
        "Location Error",
        "Could not get your location. Please enable location services and try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: loadPrayerTimes },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrayerTimes();
    setRefreshing(false);
  }, []);

  // Load prayer times when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPrayerTimes();
    }, [])
  );

  const formatTime = (time) => {
    return PrayerTimeService.formatPrayerTime(time);
  };

  const getPrayerIcon = (prayerName) => {
    const icons = {
      Fajr: "sunny-outline",
      Dhuhr: "sunny",
      Asr: "partly-sunny",
      Maghrib: "moon-outline",
      Isha: "moon",
    };
    return icons[prayerName] || "time-outline";
  };

  const renderPrayerCard = (name, time, isNext = false, isCurrent = false) => (
    <View
      key={name}
      style={[
        styles.prayerCard,
        isNext && styles.nextPrayerCard,
        isCurrent && styles.currentPrayerCard,
      ]}
    >
      <View style={styles.prayerHeader}>
        <Ionicons
          name={getPrayerIcon(name)}
          size={24}
          color={isNext ? "#fff" : isCurrent ? "#fff" : "#2E8B57"}
        />
        <Text
          style={[
            styles.prayerName,
            isNext && styles.nextPrayerText,
            isCurrent && styles.currentPrayerText,
          ]}
        >
          {name}
        </Text>
      </View>
      <Text
        style={[
          styles.prayerTime,
          isNext && styles.nextPrayerText,
          isCurrent && styles.currentPrayerText,
        ]}
      >
        {formatTime(time)}
      </Text>
      {isNext && <Text style={styles.nextPrayerLabel}>Next Prayer</Text>}
      {isCurrent && (
        <Text style={styles.currentPrayerLabel}>Current Prayer</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="time-outline" size={50} color="#2E8B57" />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.locationText}>{locationName}</Text>
        </View>

        {hijriDate && (
          <View style={styles.hijriContainer}>
            <Text style={styles.hijriDate}>{hijriDate.formatted}</Text>
            <Text style={styles.gregorianDate}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        )}
      </View>

      {/* Next Prayer Countdown */}
      {nextPrayer && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownTitle}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          <Text style={styles.countdownTime}>
            {timeUntilNext.hours}h {timeUntilNext.minutes}m
          </Text>
          <Text style={styles.nextPrayerTime}>
            {formatTime(nextPrayer.time)}
          </Text>
        </View>
      )}

      {/* Prayer Times */}
      {prayerTimes && (
        <View style={styles.prayerTimesContainer}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

          <View style={styles.prayerGrid}>
            {renderPrayerCard(
              "Fajr",
              prayerTimes.fajr,
              nextPrayer?.name === "Fajr",
              currentPrayer?.name === "Fajr"
            )}
            {renderPrayerCard(
              "Dhuhr",
              prayerTimes.dhuhr,
              nextPrayer?.name === "Dhuhr",
              currentPrayer?.name === "Dhuhr"
            )}
            {renderPrayerCard(
              "Asr",
              prayerTimes.asr,
              nextPrayer?.name === "Asr",
              currentPrayer?.name === "Asr"
            )}
            {renderPrayerCard(
              "Maghrib",
              prayerTimes.maghrib,
              nextPrayer?.name === "Maghrib",
              currentPrayer?.name === "Maghrib"
            )}
            {renderPrayerCard(
              "Isha",
              prayerTimes.isha,
              nextPrayer?.name === "Isha",
              currentPrayer?.name === "Isha"
            )}
          </View>

          {/* Sunrise time */}
          <View style={styles.sunriseContainer}>
            <Ionicons name="sunny" size={20} color="#FF6B35" />
            <Text style={styles.sunriseText}>
              Sunrise: {formatTime(prayerTimes.sunrise)}
            </Text>
          </View>
        </View>
      )}

      {/* Ramadan Info */}
      {HijriCalendarUtils.isRamadan() ? (
        <View style={styles.ramadanContainer}>
          <Ionicons name="moon" size={24} color="#8B4513" />
          <Text style={styles.ramadanText}>Ramadan Mubarak! 🌙</Text>
        </View>
      ) : (
        <View style={styles.ramadanContainer}>
          <Ionicons name="calendar-outline" size={24} color="#8B4513" />
          <Text style={styles.ramadanText}>
            {HijriCalendarUtils.getDaysUntilRamadan()} days until Ramadan
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  hijriContainer: {
    alignItems: "center",
  },
  hijriDate: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  gregorianDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  countdownContainer: {
    backgroundColor: "#2E8B57",
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countdownTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  nextPrayerName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  countdownTime: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  nextPrayerTime: {
    color: "#fff",
    fontSize: 18,
    opacity: 0.9,
  },
  prayerTimesContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  prayerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  prayerCard: {
    backgroundColor: "#fff",
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  nextPrayerCard: {
    backgroundColor: "#FF6B35",
  },
  currentPrayerCard: {
    backgroundColor: "#28a745",
  },
  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  prayerName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  nextPrayerText: {
    color: "#fff",
  },
  currentPrayerText: {
    color: "#fff",
  },
  nextPrayerLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
  currentPrayerLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
    opacity: 0.9,
  },
  sunriseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  sunriseText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "500",
  },
  ramadanContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  ramadanText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#8B4513",
    fontWeight: "500",
  },
});
