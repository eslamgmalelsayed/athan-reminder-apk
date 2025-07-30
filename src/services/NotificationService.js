import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  static async schedulePrayerNotifications(prayerTimes, location) {
    try {
      // Cancel all existing notifications first
      await Notifications.cancelAllScheduledNotificationsAsync();

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("Notification permissions not granted");
        return false;
      }

      const prayers = [
        { name: "Fajr", time: prayerTimes.fajr, emoji: "🌅" },
        { name: "Dhuhr", time: prayerTimes.dhuhr, emoji: "☀️" },
        { name: "Asr", time: prayerTimes.asr, emoji: "🌤️" },
        { name: "Maghrib", time: prayerTimes.maghrib, emoji: "🌅" },
        { name: "Isha", time: prayerTimes.isha, emoji: "🌙" },
      ];

      for (const prayer of prayers) {
        // Schedule notification for prayer time
        await this.scheduleNotification(
          `${prayer.emoji} ${prayer.name} Prayer Time`,
          `It's time for ${prayer.name} prayer in ${location}`,
          prayer.time,
          { prayerName: prayer.name, type: "prayer_time" }
        );

        // Schedule reminder 10 minutes before
        const reminderTime = new Date(prayer.time.getTime() - 10 * 60 * 1000);
        if (reminderTime > new Date()) {
          await this.scheduleNotification(
            `${prayer.emoji} ${prayer.name} Prayer Reminder`,
            `${prayer.name} prayer is in 10 minutes`,
            reminderTime,
            { prayerName: prayer.name, type: "prayer_reminder" }
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error scheduling prayer notifications:", error);
      return false;
    }
  }

  static async scheduleNotification(title, body, triggerTime, data = {}) {
    try {
      const trigger = new Date(triggerTime);

      if (trigger <= new Date()) {
        console.log("Cannot schedule notification in the past:", title);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          data,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: trigger,
        },
      });

      return notificationId;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return null;
    }
  }

  static async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }

  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error("Error canceling notifications:", error);
      return false;
    }
  }

  static async triggerHapticFeedback() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error triggering haptic feedback:", error);
    }
  }

  static addNotificationReceivedListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  static addNotificationResponseReceivedListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}
