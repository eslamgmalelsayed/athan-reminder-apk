import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TestApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🕌 Athan Reminder - Test</Text>
      <Text style={styles.subtitle}>Testing Default Export</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22C55E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
