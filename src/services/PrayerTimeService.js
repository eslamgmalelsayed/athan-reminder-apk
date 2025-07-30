import { Coordinates, CalculationMethod, PrayerTimes, Prayer } from "adhan";
import moment from "moment";

export class PrayerTimeService {
  static calculatePrayerTimes(latitude, longitude, date = new Date()) {
    try {
      const coordinates = new Coordinates(latitude, longitude);
      const params = CalculationMethod.MuslimWorldLeague();

      // You can customize calculation parameters if needed
      // params.madhab = Madhab.Hanafi; // for Asr calculation

      const prayerTimes = new PrayerTimes(coordinates, date, params);

      return {
        fajr: prayerTimes.fajr,
        sunrise: prayerTimes.sunrise,
        dhuhr: prayerTimes.dhuhr,
        asr: prayerTimes.asr,
        maghrib: prayerTimes.maghrib,
        isha: prayerTimes.isha,
        qiyam: prayerTimes.qiyam,
      };
    } catch (error) {
      console.error("Error calculating prayer times:", error);
      return null;
    }
  }

  static formatPrayerTime(time) {
    return moment(time).format("h:mm A");
  }

  static getNextPrayer(
    prayerTimes,
    currentTime = new Date(),
    coordinates = null
  ) {
    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr, prayer: Prayer.Fajr },
      { name: "Dhuhr", time: prayerTimes.dhuhr, prayer: Prayer.Dhuhr },
      { name: "Asr", time: prayerTimes.asr, prayer: Prayer.Asr },
      { name: "Maghrib", time: prayerTimes.maghrib, prayer: Prayer.Maghrib },
      { name: "Isha", time: prayerTimes.isha, prayer: Prayer.Isha },
    ];

    for (const prayer of prayers) {
      if (currentTime < prayer.time) {
        return prayer;
      }
    }

    // If no prayer is found for today, return Fajr of next day
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (coordinates) {
      const tomorrowPrayerTimes = this.calculatePrayerTimes(
        coordinates.latitude,
        coordinates.longitude,
        tomorrow
      );

      return {
        name: "Fajr",
        time: tomorrowPrayerTimes.fajr,
        prayer: Prayer.Fajr,
        isNextDay: true,
      };
    }

    return {
      name: "Fajr",
      time: new Date(tomorrow.setHours(5, 0, 0, 0)), // Default Fajr time
      prayer: Prayer.Fajr,
      isNextDay: true,
    };
  }

  static getTimeUntilNextPrayer(nextPrayerTime, currentTime = new Date()) {
    const diff = nextPrayerTime - currentTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }

  static getCurrentPrayer(prayerTimes, currentTime = new Date()) {
    const prayers = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ];

    let currentPrayer = null;

    for (let i = 0; i < prayers.length; i++) {
      if (currentTime >= prayers[i].time) {
        currentPrayer = prayers[i];
      } else {
        break;
      }
    }

    return currentPrayer;
  }
}
