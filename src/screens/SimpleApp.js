import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { PrayerTimeService } from "../services/PrayerTimeService";

// Simple prayer times for testing (static times for now)
const SAMPLE_PRAYER_TIMES = {
  fajr: "5:30 AM",
  dhuhr: "12:15 PM",
  asr: "3:45 PM",
  maghrib: "6:20 PM",
  isha: "7:50 PM",
};

export default function SimpleApp() {
  console.log("🚀 SimpleApp component starting to load...");

  const [prayerTimes, setPrayerTimes] = useState(SAMPLE_PRAYER_TIMES);
  const [location, setLocation] = useState(
    "Static Times - Tap Refresh for Real Times"
  );
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const [isLoadingPrayerTimes, setIsLoadingPrayerTimes] = useState(false);
  const [error, setError] = useState(null);

  console.log("✅ SimpleApp state initialized successfully");

  // Function to get current location and calculate prayer times
  const fetchPrayerTimes = async () => {
    console.log("🕌 Starting to fetch prayer times...");
    setIsLoadingPrayerTimes(true);
    setError(null);

    try {
      console.log("📍 Requesting location permissions...");
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("❌ Location permission denied");
        setError("Location permission denied");
        setLocation("Permission denied");
        return;
      }

      console.log("✅ Location permission granted");
      console.log("🔍 Getting current location...");

      let locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      console.log(`📍 Location found: ${latitude}, ${longitude}`);

      // Get address from coordinates
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        const locationText = `${address.city || "Unknown"}, ${
          address.country || "Unknown"
        }`;
        setLocation(locationText);
        console.log(`🏠 Address: ${locationText}`);
      } catch (error) {
        console.log("⚠️ Could not get address:", error.message);
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }

      // Calculate prayer times using the service
      console.log("🕐 Calculating prayer times...");
      const prayerTimesData = PrayerTimeService.calculatePrayerTimes(
        latitude,
        longitude
      );

      if (prayerTimesData) {
        const formattedTimes = {
          fajr: PrayerTimeService.formatPrayerTime(prayerTimesData.fajr),
          dhuhr: PrayerTimeService.formatPrayerTime(prayerTimesData.dhuhr),
          asr: PrayerTimeService.formatPrayerTime(prayerTimesData.asr),
          maghrib: PrayerTimeService.formatPrayerTime(prayerTimesData.maghrib),
          isha: PrayerTimeService.formatPrayerTime(prayerTimesData.isha),
        };

        console.log("✅ Prayer times calculated successfully:");
        console.log("🌅 Fajr:", formattedTimes.fajr);
        console.log("☀️ Dhuhr:", formattedTimes.dhuhr);
        console.log("🌤️ Asr:", formattedTimes.asr);
        console.log("🌅 Maghrib:", formattedTimes.maghrib);
        console.log("🌙 Isha:", formattedTimes.isha);

        setPrayerTimes(formattedTimes);

        // Get next prayer info
        const nextPrayer = PrayerTimeService.getNextPrayer(prayerTimesData);
        if (nextPrayer) {
          console.log(
            `🔔 Next prayer: ${
              nextPrayer.name
            } at ${PrayerTimeService.formatPrayerTime(nextPrayer.time)}`
          );
        }
      } else {
        console.log("❌ Failed to calculate prayer times");
        setError("Failed to calculate prayer times");
      }
    } catch (error) {
      console.error("❌ Error fetching prayer times:", error);
      setError(`Error: ${error.message}`);
      setLocation("Error getting location");
    } finally {
      setIsLoadingPrayerTimes(false);
      console.log("✅ Prayer times fetch completed");
    }
  };

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const requestPermissions = () => {
    Alert.alert(
      "Permissions Required",
      "This app needs location and notification permissions to work properly.",
      [
        {
          text: "Get Prayer Times",
          onPress: () => {
            console.log("🔔 User requested prayer times");
            fetchPrayerTimes();
          },
        },
        {
          text: "Cancel",
          onPress: () => console.log("❌ User cancelled permission request"),
        },
      ]
    );
  };

  useEffect(() => {
    // Don't auto-fetch prayer times on startup to prevent loading issues
    // User can manually refresh to get real times
    console.log("🚀 App started successfully - using static prayer times");
    console.log(
      "📱 User can tap 'Refresh Prayer Times' to get real times based on location"
    );
  }, []);

  const PrayerCard = ({ name, time, icon }) => (
    <View style={styles.prayerCard}>
      <View style={styles.prayerInfo}>
        <Text style={styles.prayerIcon}>{icon}</Text>
        <Text style={styles.prayerName}>{name}</Text>
      </View>
      <Text style={styles.prayerTime}>{time}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🕌 Prayer Times</Text>
        <Text style={styles.location}>📍 {location}</Text>
        <Text style={styles.currentTime}>🕐 {currentTime}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        {isLoadingPrayerTimes && (
          <Text style={styles.loadingText}>🔄 Loading prayer times...</Text>
        )}
        {error && <Text style={styles.errorText}>❌ {error}</Text>}
      </View>

      {/* Prayer Times */}
      <View style={styles.prayerContainer}>
        <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

        <PrayerCard name="Fajr" time={prayerTimes.fajr} icon="🌅" />
        <PrayerCard name="Dhuhr" time={prayerTimes.dhuhr} icon="☀️" />
        <PrayerCard name="Asr" time={prayerTimes.asr} icon="🌤️" />
        <PrayerCard name="Maghrib" time={prayerTimes.maghrib} icon="🌅" />
        <PrayerCard name="Isha" time={prayerTimes.isha} icon="🌙" />
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isLoadingPrayerTimes && styles.disabledButton,
        ]}
        onPress={fetchPrayerTimes}
        disabled={isLoadingPrayerTimes}
      >
        <Text style={styles.actionButtonText}>
          {isLoadingPrayerTimes ? "🔄 Loading..." : "🔄 Refresh Prayer Times"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.permissionButton}
        onPress={requestPermissions}
      >
        <Text style={styles.actionButtonText}>🔔 Enable Notifications</Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📱 Real-time prayer times based on your location{"\n"}� Tap "Refresh
          Prayer Times" to update{"\n"}
          🔔 Tap "Enable Notifications" for prayer alerts{"\n"}� Location:{" "}
          {location}
          {"\n"}� Check console logs for API details
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  location: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
    opacity: 0.9,
  },
  currentTime: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  prayerContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
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
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  prayerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  prayerIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  prayerName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  prayerTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22C55E",
  },
  actionButton: {
    backgroundColor: "#22C55E",
    margin: 20,
    marginBottom: 10,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  permissionButton: {
    backgroundColor: "#22C55E",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  errorText: {
    color: "#FEF2F2",
    fontSize: 14,
    marginTop: 5,
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 6,
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
  },
});
