import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

console.log("🚀 MinimalApp component loading...");

// Ultra-simple prayer times (no API calls)
const PRAYER_TIMES = {
  fajr: "5:30 AM",
  dhuhr: "12:15 PM",
  asr: "3:45 PM",
  maghrib: "6:20 PM",
  isha: "7:50 PM",
};

export default function MinimalApp() {
  console.log("✅ MinimalApp function started");

  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  console.log("✅ MinimalApp state initialized");

  useEffect(() => {
    console.log("✅ MinimalApp useEffect started");
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      console.log("✅ MinimalApp cleanup");
      clearInterval(timer);
    };
  }, []);

  console.log("✅ MinimalApp about to render");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕌 Prayer Times</Text>
        <Text style={styles.currentTime}>🕐 {currentTime}</Text>
        <Text style={styles.location}>📍 Test Location</Text>
      </View>

      <View style={styles.prayerContainer}>
        <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerName}>🌅 Fajr</Text>
          <Text style={styles.prayerTime}>{PRAYER_TIMES.fajr}</Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerName}>☀️ Dhuhr</Text>
          <Text style={styles.prayerTime}>{PRAYER_TIMES.dhuhr}</Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerName}>🌤️ Asr</Text>
          <Text style={styles.prayerTime}>{PRAYER_TIMES.asr}</Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerName}>🌅 Maghrib</Text>
          <Text style={styles.prayerTime}>{PRAYER_TIMES.maghrib}</Text>
        </View>

        <View style={styles.prayerCard}>
          <Text style={styles.prayerName}>🌙 Isha</Text>
          <Text style={styles.prayerTime}>{PRAYER_TIMES.isha}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log("✅ Button pressed successfully!");
          alert("Button works! App is responsive.");
        }}
      >
        <Text style={styles.buttonText}>✅ Test Button</Text>
      </TouchableOpacity>
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
  currentTime: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  location: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.9,
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
  button: {
    backgroundColor: "#22C55E",
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

console.log("✅ MinimalApp module loaded successfully");
