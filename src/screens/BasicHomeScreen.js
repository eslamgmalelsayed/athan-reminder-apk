import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { PrayerTimeService } from "../services/PrayerTimeService";

// Configure notifications to show alert and play sound
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function BasicHomeScreen() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState("Getting location...");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const requestPermissions = async () => {
    try {
      // Request location permission
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();

      // Request notification permission
      const { status: notificationStatus } =
        await Notifications.requestPermissionsAsync();

      if (locationStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to calculate prayer times for your area."
        );
        return false;
      }

      if (notificationStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Notification permission is needed to remind you of prayer times."
        );
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const loadPrayerTimes = async () => {
    try {
      setIsLoading(true);

      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        setIsLoading(false);
        return;
      }

      // Get current location
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = locationResult.coords.latitude;
      const lng = locationResult.coords.longitude;

      // Get location name
      const geocode = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      const cityName =
        geocode[0]?.city || geocode[0]?.region || "Your Location";
      setLocation(cityName);

      // Calculate prayer times
      const times = PrayerTimeService.calculatePrayerTimes(
        lat,
        lng,
        new Date()
      );
      setPrayerTimes(times);

      // Schedule notifications for today
      await scheduleNotifications(times);
    } catch (error) {
      console.error("Error loading prayer times:", error);
      Alert.alert("Error", "Could not load prayer times. Please try again.");

      // Use default location (Mecca) as fallback
      const times = PrayerTimeService.calculatePrayerTimes(
        21.3891,
        39.8579,
        new Date()
      );
      setPrayerTimes(times);
      setLocation("Mecca, Saudi Arabia (Default)");
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleNotifications = async (times) => {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      const prayers = [
        { name: "Fajr", time: times.fajr },
        { name: "Dhuhr", time: times.dhuhr },
        { name: "Asr", time: times.asr },
        { name: "Maghrib", time: times.maghrib },
        { name: "Isha", time: times.isha },
      ];

      for (const prayer of prayers) {
        if (prayer.time > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.name} Prayer Time`,
              body: `It's time for ${prayer.name} prayer`,
              sound: "default",
            },
            trigger: {
              date: prayer.time,
            },
          });
        }
      }

      console.log("Prayer notifications scheduled");
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrayerTimes();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="time-outline" size={60} color="#22C55E" />
        <Text style={styles.loadingText}>Loading Prayer Times...</Text>
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
        <Text style={styles.title}>🕌 Prayer Times</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Prayer Times */}
      {prayerTimes && (
        <View style={styles.prayerContainer}>
          <PrayerCard
            name="Fajr"
            time={prayerTimes.fajr}
            icon="sunny-outline"
          />
          <PrayerCard name="Dhuhr" time={prayerTimes.dhuhr} icon="sunny" />
          <PrayerCard name="Asr" time={prayerTimes.asr} icon="partly-sunny" />
          <PrayerCard
            name="Maghrib"
            time={prayerTimes.maghrib}
            icon="moon-outline"
          />
          <PrayerCard name="Isha" time={prayerTimes.isha} icon="moon" />
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • Pull down to refresh{"\n"}• Notifications will alert you at prayer
          times{"\n"}• Times calculated for your location
        </Text>
      </View>
    </ScrollView>
  );
}

function PrayerCard({ name, time, icon }) {
  return (
    <View style={styles.prayerCard}>
      <View style={styles.prayerInfo}>
        <Ionicons name={icon} size={24} color="#22C55E" />
        <Text style={styles.prayerName}>{name}</Text>
      </View>
      <Text style={styles.prayerTime}>
        {new Date(time).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}
      </Text>
    </View>
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
    marginTop: 20,
    fontSize: 18,
    color: "#22C55E",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#22C55E",
    padding: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  locationText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
    opacity: 0.9,
  },
  dateText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  prayerContainer: {
    padding: 20,
  },
  prayerCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22C55E",
  },
  refreshButton: {
    backgroundColor: "#22C55E",
    margin: 20,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
});
