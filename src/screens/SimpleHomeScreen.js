import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { PrayerTimeService } from "../services/PrayerTimeService";
import { HijriCalendarUtils } from "../utils/HijriCalendarUtils";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("Loading...");
  const [hijriDate, setHijriDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadBasicData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Default location (Mecca) to ensure the app works
      const defaultLocation = {
        latitude: 21.3891,
        longitude: 39.8579,
        name: "Mecca, Saudi Arabia",
      };

      setLocation(defaultLocation);
      setLocationName(defaultLocation.name);

      // Calculate prayer times for default location
      const times = PrayerTimeService.calculatePrayerTimes(
        defaultLocation.latitude,
        defaultLocation.longitude,
        new Date()
      );

      if (times) {
        setPrayerTimes(times);
      }

      // Get Hijri date
      const hijri = HijriCalendarUtils.getHijriDate();
      setHijriDate(hijri);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Could not load prayer times. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBasicData();
    setRefreshing(false);
  }, []);

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadBasicData();
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

  const renderPrayerCard = (name, time) => (
    <View key={name} style={styles.prayerCard}>
      <View style={styles.prayerHeader}>
        <Ionicons name={getPrayerIcon(name)} size={24} color="#2E8B57" />
        <Text style={styles.prayerName}>{name}</Text>
      </View>
      <Text style={styles.prayerTime}>{formatTime(time)}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="time-outline" size={50} color="#2E8B57" />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
        <Text style={styles.loadingSubtext}>
          This should only take a moment
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#dc3545" />
        <Text style={styles.errorText}>Oops! Something went wrong</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBasicData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
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

      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>🕌 Assalamu Alaikum</Text>
        <Text style={styles.welcomeText}>
          May Allah bless your prayers. Here are today's prayer times.
        </Text>
      </View>

      {/* Prayer Times */}
      {prayerTimes && (
        <View style={styles.prayerTimesContainer}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

          <View style={styles.prayerGrid}>
            {renderPrayerCard("Fajr", prayerTimes.fajr)}
            {renderPrayerCard("Dhuhr", prayerTimes.dhuhr)}
            {renderPrayerCard("Asr", prayerTimes.asr)}
            {renderPrayerCard("Maghrib", prayerTimes.maghrib)}
            {renderPrayerCard("Isha", prayerTimes.isha)}
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

      {/* Info Card */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E8B57"
          />
          <Text style={styles.infoText}>
            Prayer times are calculated using the Muslim World League method for{" "}
            {locationName}. Pull down to refresh or go to Settings to customize
            your location.
          </Text>
        </View>
      </View>

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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: "#dc3545",
    fontWeight: "500",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#2E8B57",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
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
  welcomeContainer: {
    backgroundColor: "#2E8B57",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  welcomeTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
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
  infoContainer: {
    margin: 20,
    marginTop: 0,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
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
