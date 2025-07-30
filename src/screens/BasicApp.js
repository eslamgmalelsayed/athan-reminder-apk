import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import moment from "moment";

export default function BasicApp() {
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: "5:30 AM",
    dhuhr: "12:15 PM",
    asr: "3:45 PM",
    maghrib: "6:20 PM",
    isha: "7:50 PM",
  });
  const [location, setLocation] = useState("Getting location...");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to get appropriate calculation method based on location
  const getCalculationMethod = (latitude, longitude, country) => {
    // Define calculation methods for different regions
    if (country) {
      const countryLower = country.toLowerCase();

      // North America (ISNA)
      if (
        countryLower.includes("united states") ||
        countryLower.includes("canada")
      ) {
        return CalculationMethod.NorthAmerica();
      }

      // Middle East and Egypt
      if (countryLower.includes("egypt")) {
        return CalculationMethod.Egyptian();
      }

      // Turkey
      if (countryLower.includes("turkey")) {
        return CalculationMethod.Turkey();
      }

      // Kuwait
      if (countryLower.includes("kuwait")) {
        return CalculationMethod.Kuwait();
      }

      // Qatar
      if (countryLower.includes("qatar")) {
        return CalculationMethod.Qatar();
      }

      // Singapore, Malaysia, Brunei
      if (
        countryLower.includes("singapore") ||
        countryLower.includes("malaysia") ||
        countryLower.includes("brunei")
      ) {
        return CalculationMethod.Singapore();
      }

      // UAE
      if (countryLower.includes("emirates") || countryLower.includes("uae")) {
        return CalculationMethod.Dubai();
      }

      // European countries
      if (
        countryLower.includes("france") ||
        countryLower.includes("germany") ||
        countryLower.includes("united kingdom") ||
        countryLower.includes("netherlands") ||
        countryLower.includes("belgium") ||
        countryLower.includes("spain")
      ) {
        return CalculationMethod.MuslimWorldLeague();
      }
    }

    // Default based on latitude
    if (latitude > 45) {
      return CalculationMethod.MuslimWorldLeague();
    } else if (latitude < 25) {
      return CalculationMethod.UmmAlQura();
    } else {
      return CalculationMethod.MuslimWorldLeague();
    }
  };

  // Function to calculate prayer times based on coordinates
  const calculatePrayerTimes = (latitude, longitude, country = null) => {
    try {
      const coordinates = new Coordinates(latitude, longitude);
      const params = getCalculationMethod(latitude, longitude, country);
      const date = new Date();

      const prayerTimesData = new PrayerTimes(coordinates, date, params);

      const formattedTimes = {
        fajr: moment(prayerTimesData.fajr).format("h:mm A"),
        dhuhr: moment(prayerTimesData.dhuhr).format("h:mm A"),
        asr: moment(prayerTimesData.asr).format("h:mm A"),
        maghrib: moment(prayerTimesData.maghrib).format("h:mm A"),
        isha: moment(prayerTimesData.isha).format("h:mm A"),
      };

      return formattedTimes;
    } catch (error) {
      return null;
    }
  };

  // Function to get location and fetch prayer times
  const fetchPrayerTimesWithLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission is required for accurate prayer times");
        setLocation("Permission denied");
        return;
      }

      // Get current location with high accuracy
      let locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      });

      const { latitude, longitude } = locationData.coords;

      let country = null;
      let locationText = "Getting address...";

      // Get address from coordinates with better error handling
      try {
        const addressArray = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressArray && addressArray.length > 0) {
          const address = addressArray[0];
          country = address.country;

          // Try multiple fallbacks for city name
          const city =
            address.city ||
            address.district ||
            address.subregion ||
            address.region ||
            address.name ||
            "Unknown City";

          // Build location string with preference for readable names
          if (country && city !== "Unknown City") {
            locationText = `${city}, ${country}`;
          } else if (country) {
            locationText = country;
          } else if (city !== "Unknown City") {
            locationText = city;
          } else {
            locationText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
        } else {
          // No address data returned
          locationText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        setLocation(locationText);
      } catch (addressError) {
        // Network or API error - show coordinates as fallback
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }

      // Calculate prayer times with country-specific method
      const calculatedTimes = calculatePrayerTimes(
        latitude,
        longitude,
        country
      );

      if (calculatedTimes) {
        setPrayerTimes(calculatedTimes);
      } else {
        setError("Failed to calculate prayer times");
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      setLocation("Error getting location");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch prayer times on app start
  useEffect(() => {
    fetchPrayerTimesWithLocation();
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕌 Athan Reminder</Text>
        {isLoading && (
          <Text style={styles.loadingText}>🔄 Loading prayer times...</Text>
        )}
        {error && <Text style={styles.errorText}>❌ {error}</Text>}
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌅 Fajr</Text>
            <Text style={styles.prayerTime}>{prayerTimes.fajr}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>☀️ Dhuhr</Text>
            <Text style={styles.prayerTime}>{prayerTimes.dhuhr}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌤️ Asr</Text>
            <Text style={styles.prayerTime}>{prayerTimes.asr}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌅 Maghrib</Text>
            <Text style={styles.prayerTime}>{prayerTimes.maghrib}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌙 Isha</Text>
            <Text style={styles.prayerTime}>{prayerTimes.isha}</Text>
          </View>

          {/* Extra space at bottom for scrolling */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.fixedBottom}>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.disabledButton]}
          onPress={fetchPrayerTimesWithLocation}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "🔄 Loading..." : "🔄 Refresh Prayer Times"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>✅ Location-based Prayer Times</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#22C55E",
    padding: 40,
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 5,
  },
  loadingText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: "#FEF2F2",
    backgroundColor: "#DC2626",
    padding: 8,
    borderRadius: 6,
    marginTop: 5,
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  fixedBottom: {
    backgroundColor: "#f5f5f5",
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  prayerRow: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22C55E",
  },
  refreshButton: {
    backgroundColor: "#22C55E",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 3,
    textAlign: "center",
  },
});
