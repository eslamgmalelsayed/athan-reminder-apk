import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HijriCalendarUtils } from "../utils/HijriCalendarUtils";
import { PrayerTimeService } from "../services/PrayerTimeService";
import { StorageService } from "../services/StorageService";

export default function CalendarScreen() {
  const [hijriDate, setHijriDate] = useState(null);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [monthlyPrayerTimes, setMonthlyPrayerTimes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRamadan, setIsRamadan] = useState(false);
  const [daysUntilRamadan, setDaysUntilRamadan] = useState(0);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      // Get Hijri date
      const hijri = HijriCalendarUtils.getHijriDate(selectedDate);
      setHijriDate(hijri);

      // Get upcoming holidays
      const holidays = HijriCalendarUtils.getUpcomingHolidays(selectedDate, 5);
      setUpcomingHolidays(holidays);

      // Check if it's Ramadan
      const ramadanStatus = HijriCalendarUtils.isRamadan(selectedDate);
      setIsRamadan(ramadanStatus);

      // Get days until Ramadan
      if (!ramadanStatus) {
        const daysUntil = HijriCalendarUtils.getDaysUntilRamadan(selectedDate);
        setDaysUntilRamadan(daysUntil);
      }

      // Load prayer times for the month
      await loadMonthlyPrayerTimes();
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  const loadMonthlyPrayerTimes = async () => {
    try {
      const location = await StorageService.getUserLocation();
      if (!location) return;

      const currentMonth = selectedDate.getMonth();
      const currentYear = selectedDate.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const monthlyTimes = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const times = PrayerTimeService.calculatePrayerTimes(
          location.latitude,
          location.longitude,
          date
        );

        if (times) {
          monthlyTimes.push({
            date,
            day,
            times,
            hijriDate: HijriCalendarUtils.getHijriDate(date),
          });
        }
      }

      setMonthlyPrayerTimes(monthlyTimes);
    } catch (error) {
      console.error("Error loading monthly prayer times:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  useEffect(() => {
    loadCalendarData();
  }, [selectedDate]);

  const formatTime = (time) => {
    return PrayerTimeService.formatPrayerTime(time);
  };

  const renderHolidayCard = (holiday, index) => (
    <View key={index} style={styles.holidayCard}>
      <View style={styles.holidayHeader}>
        <Ionicons name="calendar" size={20} color="#2E8B57" />
        <Text style={styles.holidayName}>{holiday.name}</Text>
      </View>
      <Text style={styles.holidayDescription}>{holiday.description}</Text>
      <View style={styles.holidayDateContainer}>
        <Text style={styles.holidayDate}>
          {holiday.date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.holidayDaysUntil}>
          {holiday.daysUntil === 0
            ? "Today"
            : holiday.daysUntil === 1
            ? "Tomorrow"
            : `${holiday.daysUntil} days`}
        </Text>
      </View>
    </View>
  );

  const renderDayCard = (dayData) => {
    const isToday = dayData.date.toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        key={dayData.day}
        style={[styles.dayCard, isToday && styles.todayCard]}
        onPress={() => {
          Alert.alert(
            `Prayer Times - ${dayData.date.toLocaleDateString()}`,
            `Fajr: ${formatTime(dayData.times.fajr)}\n` +
              `Dhuhr: ${formatTime(dayData.times.dhuhr)}\n` +
              `Asr: ${formatTime(dayData.times.asr)}\n` +
              `Maghrib: ${formatTime(dayData.times.maghrib)}\n` +
              `Isha: ${formatTime(dayData.times.isha)}`
          );
        }}
      >
        <View style={styles.dayHeader}>
          <Text style={[styles.dayNumber, isToday && styles.todayText]}>
            {dayData.day}
          </Text>
          {isToday && (
            <View style={styles.todayIndicator}>
              <Text style={styles.todayLabel}>Today</Text>
            </View>
          )}
        </View>

        <Text style={[styles.hijriDay, isToday && styles.todayText]}>
          {dayData.hijriDate?.day}{" "}
          {dayData.hijriDate?.monthName?.substring(0, 3)}
        </Text>

        <View style={styles.dayPrayerTimes}>
          <Text style={[styles.prayerTimeSmall, isToday && styles.todayText]}>
            Fajr: {formatTime(dayData.times.fajr)}
          </Text>
          <Text style={[styles.prayerTimeSmall, isToday && styles.todayText]}>
            Maghrib: {formatTime(dayData.times.maghrib)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => navigateMonth(-1)}>
            <Ionicons name="chevron-back" size={24} color="#2E8B57" />
          </TouchableOpacity>

          <View style={styles.monthInfo}>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            {hijriDate && (
              <Text style={styles.hijriMonthText}>
                {hijriDate.monthName} {hijriDate.year} AH
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => navigateMonth(1)}>
            <Ionicons name="chevron-forward" size={24} color="#2E8B57" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ramadan Status */}
      {isRamadan ? (
        <View style={styles.ramadanContainer}>
          <Ionicons name="moon" size={24} color="#8B4513" />
          <Text style={styles.ramadanText}>Ramadan Mubarak! 🌙</Text>
          <Text style={styles.ramadanSubtext}>
            May this holy month bring you peace and blessings
          </Text>
        </View>
      ) : (
        daysUntilRamadan !== null && (
          <View style={styles.ramadanContainer}>
            <Ionicons name="calendar-outline" size={24} color="#8B4513" />
            <Text style={styles.ramadanText}>
              {daysUntilRamadan} days until Ramadan
            </Text>
            <Text style={styles.ramadanSubtext}>
              Prepare your heart for the holy month
            </Text>
          </View>
        )
      )}

      {/* Upcoming Islamic Holidays */}
      {upcomingHolidays.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Islamic Events</Text>
          {upcomingHolidays.map((holiday, index) =>
            renderHolidayCard(holiday, index)
          )}
        </View>
      )}

      {/* Monthly Prayer Times */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Prayer Times</Text>
        <View style={styles.monthlyGrid}>
          {monthlyPrayerTimes.map(renderDayCard)}
        </View>
      </View>

      {/* Islamic Calendar Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E8B57"
          />
          <Text style={styles.infoText}>
            Islamic calendar is based on lunar months and may vary by location
            and moon sighting.
          </Text>
        </View>
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
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthInfo: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  hijriMonthText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  ramadanContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  ramadanText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 10,
    textAlign: "center",
  },
  ramadanSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  holidayCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  holidayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  holidayDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  holidayDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  holidayDate: {
    fontSize: 14,
    color: "#2E8B57",
    fontWeight: "500",
  },
  holidayDaysUntil: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  monthlyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCard: {
    backgroundColor: "#fff",
    width: "48%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  todayCard: {
    backgroundColor: "#2E8B57",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  todayText: {
    color: "#fff",
  },
  todayIndicator: {
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayLabel: {
    fontSize: 10,
    color: "#2E8B57",
    fontWeight: "bold",
  },
  hijriDay: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  dayPrayerTimes: {
    gap: 2,
  },
  prayerTimeSmall: {
    fontSize: 11,
    color: "#666",
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
});
