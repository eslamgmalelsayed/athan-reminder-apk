import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function App() {
  const [prayerTimes, setPrayerTimes] = useState({
    fajr: "5:30 AM",
    dhuhr: "12:15 PM",
    asr: "3:45 PM",
    maghrib: "6:20 PM",
    isha: "7:50 PM",
  });
  const [location, setLocation] = useState("Demo Location");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🕌 Athan Reminder</Text>
        <Text style={styles.subtitle}>Islamic Prayer Times</Text>
        <Text style={styles.location}>📍 {location}</Text>
        {isLoading && (
          <Text style={styles.loadingText}>🔄 Loading prayer times...</Text>
        )}
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Today's Prayer Times</Text>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌅 Fajr (Dawn)</Text>
            <Text style={styles.prayerTime}>{prayerTimes.fajr}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>☀️ Dhuhr (Noon)</Text>
            <Text style={styles.prayerTime}>{prayerTimes.dhuhr}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌤️ Asr (Afternoon)</Text>
            <Text style={styles.prayerTime}>{prayerTimes.asr}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌅 Maghrib (Sunset)</Text>
            <Text style={styles.prayerTime}>{prayerTimes.maghrib}</Text>
          </View>

          <View style={styles.prayerRow}>
            <Text style={styles.prayerName}>🌙 Isha (Night)</Text>
            <Text style={styles.prayerTime}>{prayerTimes.isha}</Text>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.fixedBottom}>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.disabledButton]}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🔄 Demo Mode - Prayer Times</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>✅ Islamic Prayer Times Demo</Text>
          <Text style={styles.footerText}>
            🤲 May Allah accept your prayers
          </Text>
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
