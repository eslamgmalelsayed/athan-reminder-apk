import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { NotificationService } from "../services/NotificationService";
import { StorageService } from "../services/StorageService";
import { LocationService } from "../services/LocationService";

export default function SettingsScreen() {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    reminderMinutes: 10,
    prayers: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    },
  });
  const [appSettings, setAppSettings] = useState({
    theme: "light",
    language: "en",
    is24HourFormat: false,
    autoLocation: true,
  });
  const [locationInfo, setLocationInfo] = useState(null);

  useEffect(() => {
    loadSettings();
    loadLocationInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await StorageService.getNotificationSettings();
      const app = await StorageService.getAppSettings();

      setNotificationSettings(notifications);
      setAppSettings(app);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const loadLocationInfo = async () => {
    try {
      const location = await StorageService.getUserLocation();
      setLocationInfo(location);
    } catch (error) {
      console.error("Error loading location info:", error);
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      const updated = { ...notificationSettings, ...newSettings };
      setNotificationSettings(updated);
      await StorageService.saveNotificationSettings(updated);

      // Re-schedule notifications if enabled
      if (updated.enabled) {
        const lastPrayerTimes = await StorageService.getLastPrayerTimes();
        if (lastPrayerTimes) {
          await NotificationService.schedulePrayerNotifications(
            lastPrayerTimes.prayerTimes,
            lastPrayerTimes.location.name
          );
        }
      } else {
        await NotificationService.cancelAllNotifications();
      }
    } catch (error) {
      console.error("Error updating notification settings:", error);
      Alert.alert("Error", "Could not update notification settings.");
    }
  };

  const updateAppSettings = async (newSettings) => {
    try {
      const updated = { ...appSettings, ...newSettings };
      setAppSettings(updated);
      await StorageService.saveAppSettings(updated);
    } catch (error) {
      console.error("Error updating app settings:", error);
      Alert.alert("Error", "Could not update app settings.");
    }
  };

  const updatePrayerNotification = async (prayer, enabled) => {
    const newPrayers = { ...notificationSettings.prayers, [prayer]: enabled };
    await updateNotificationSettings({ prayers: newPrayers });
  };

  const refreshLocation = async () => {
    try {
      Alert.alert(
        "Refresh Location",
        "This will get your current location and update prayer times.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Refresh",
            onPress: async () => {
              try {
                const currentLocation =
                  await LocationService.getCurrentLocation();
                const name = await LocationService.getLocationName(
                  currentLocation.latitude,
                  currentLocation.longitude
                );

                const location = { ...currentLocation, name };
                await StorageService.saveUserLocation(location);
                setLocationInfo(location);

                Alert.alert("Success", "Location updated successfully!");
              } catch (error) {
                Alert.alert("Error", "Could not get current location.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error refreshing location:", error);
    }
  };

  const openNotificationSettings = () => {
    Alert.alert(
      "Notification Settings",
      "Open system notification settings to manage app notifications.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all saved settings and data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              await NotificationService.cancelAllNotifications();
              Alert.alert("Success", "All data has been cleared.");

              // Reset to default settings
              await loadSettings();
            } catch (error) {
              Alert.alert("Error", "Could not clear data.");
            }
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#2E8B57" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSettingItem = (title, subtitle, rightComponent) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </View>
  );

  const renderSwitchItem = (title, subtitle, value, onValueChange) =>
    renderSettingItem(
      title,
      subtitle,
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#767577", true: "#2E8B57" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
      />
    );

  const renderButtonItem = (
    title,
    subtitle,
    onPress,
    iconName = "chevron-forward"
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name={iconName} size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Section */}
      {renderSectionHeader("Notifications", "notifications-outline")}

      {renderSwitchItem(
        "Prayer Notifications",
        "Enable prayer time notifications",
        notificationSettings.enabled,
        (value) => updateNotificationSettings({ enabled: value })
      )}

      {notificationSettings.enabled && (
        <>
          <Text style={styles.subSectionTitle}>Prayer Notifications</Text>
          {renderSwitchItem(
            "Fajr",
            "Dawn prayer notification",
            notificationSettings.prayers.fajr,
            (value) => updatePrayerNotification("fajr", value)
          )}
          {renderSwitchItem(
            "Dhuhr",
            "Noon prayer notification",
            notificationSettings.prayers.dhuhr,
            (value) => updatePrayerNotification("dhuhr", value)
          )}
          {renderSwitchItem(
            "Asr",
            "Afternoon prayer notification",
            notificationSettings.prayers.asr,
            (value) => updatePrayerNotification("asr", value)
          )}
          {renderSwitchItem(
            "Maghrib",
            "Sunset prayer notification",
            notificationSettings.prayers.maghrib,
            (value) => updatePrayerNotification("maghrib", value)
          )}
          {renderSwitchItem(
            "Isha",
            "Night prayer notification",
            notificationSettings.prayers.isha,
            (value) => updatePrayerNotification("isha", value)
          )}
        </>
      )}

      {renderButtonItem(
        "System Notification Settings",
        "Manage app notifications in system settings",
        openNotificationSettings,
        "settings-outline"
      )}

      {/* Location Section */}
      {renderSectionHeader("Location", "location-outline")}

      {renderSwitchItem(
        "Auto-detect Location",
        "Automatically use current location",
        appSettings.autoLocation,
        (value) => updateAppSettings({ autoLocation: value })
      )}

      {locationInfo &&
        renderSettingItem(
          "Current Location",
          locationInfo.name || "Unknown",
          <TouchableOpacity onPress={refreshLocation}>
            <Ionicons name="refresh-outline" size={20} color="#2E8B57" />
          </TouchableOpacity>
        )}

      {renderButtonItem(
        "Refresh Location",
        "Update current location and prayer times",
        refreshLocation,
        "refresh-outline"
      )}

      {/* Display Section */}
      {renderSectionHeader("Display", "phone-portrait-outline")}

      {renderSwitchItem(
        "24-Hour Format",
        "Display times in 24-hour format",
        appSettings.is24HourFormat,
        (value) => updateAppSettings({ is24HourFormat: value })
      )}

      {/* About Section */}
      {renderSectionHeader("About", "information-circle-outline")}

      {renderButtonItem("App Version", "1.0.0", () => {}, null)}

      {renderButtonItem(
        "Prayer Time Calculation",
        "Using Muslim World League method",
        () =>
          Alert.alert(
            "Prayer Time Calculation",
            "This app uses the Muslim World League calculation method for prayer times, which is widely accepted globally."
          ),
        "information-outline"
      )}

      {/* Data Section */}
      {renderSectionHeader("Data", "server-outline")}

      {renderButtonItem(
        "Clear All Data",
        "Remove all saved settings and data",
        clearAllData,
        "trash-outline"
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Prayer times are calculated using your location and the Muslim World
          League method.
        </Text>
        <Text style={styles.footerText}>May Allah accept your prayers. 🤲</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 5,
  },
});
