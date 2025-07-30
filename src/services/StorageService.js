import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageService {
  static KEYS = {
    USER_LOCATION: "user_location",
    NOTIFICATION_SETTINGS: "notification_settings",
    PRAYER_METHOD: "prayer_method",
    APP_SETTINGS: "app_settings",
    LAST_PRAYER_TIMES: "last_prayer_times",
  };

  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error("Error saving data:", error);
      return false;
    }
  }

  static async getItem(key, defaultValue = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error("Error retrieving data:", error);
      return defaultValue;
    }
  }

  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing data:", error);
      return false;
    }
  }

  static async saveUserLocation(location) {
    return await this.setItem(this.KEYS.USER_LOCATION, {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: Date.now(),
      name: location.name,
    });
  }

  static async getUserLocation() {
    return await this.getItem(this.KEYS.USER_LOCATION);
  }

  static async saveNotificationSettings(settings) {
    const defaultSettings = {
      enabled: true,
      reminderMinutes: 10,
      prayers: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
    };

    const mergedSettings = { ...defaultSettings, ...settings };
    return await this.setItem(this.KEYS.NOTIFICATION_SETTINGS, mergedSettings);
  }

  static async getNotificationSettings() {
    const defaultSettings = {
      enabled: true,
      reminderMinutes: 10,
      prayers: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
      },
    };

    const settings = await this.getItem(
      this.KEYS.NOTIFICATION_SETTINGS,
      defaultSettings
    );
    return { ...defaultSettings, ...settings };
  }

  static async savePrayerMethod(method) {
    return await this.setItem(this.KEYS.PRAYER_METHOD, method);
  }

  static async getPrayerMethod() {
    return await this.getItem(this.KEYS.PRAYER_METHOD, "MuslimWorldLeague");
  }

  static async saveAppSettings(settings) {
    const defaultSettings = {
      theme: "light",
      language: "en",
      is24HourFormat: false,
      autoLocation: true,
    };

    const mergedSettings = { ...defaultSettings, ...settings };
    return await this.setItem(this.KEYS.APP_SETTINGS, mergedSettings);
  }

  static async getAppSettings() {
    const defaultSettings = {
      theme: "light",
      language: "en",
      is24HourFormat: false,
      autoLocation: true,
    };

    const settings = await this.getItem(
      this.KEYS.APP_SETTINGS,
      defaultSettings
    );
    return { ...defaultSettings, ...settings };
  }

  static async saveLastPrayerTimes(prayerTimes, location) {
    return await this.setItem(this.KEYS.LAST_PRAYER_TIMES, {
      prayerTimes,
      location,
      date: new Date().toDateString(),
      timestamp: Date.now(),
    });
  }

  static async getLastPrayerTimes() {
    return await this.getItem(this.KEYS.LAST_PRAYER_TIMES);
  }

  static async clearAllData() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      return false;
    }
  }
}
