import HijriDate from "hijri-date";
import moment from "moment";

export class HijriCalendarUtils {
  static getHijriDate(date = new Date()) {
    try {
      const hijriDate = new HijriDate(date);
      return {
        day: hijriDate.getDate(),
        month: hijriDate.getMonth() + 1, // getMonth() returns 0-based month
        year: hijriDate.getFullYear(),
        monthName: this.getHijriMonthName(hijriDate.getMonth() + 1),
        formatted: this.formatHijriDate(hijriDate),
      };
    } catch (error) {
      console.error("Error getting Hijri date:", error);
      return null;
    }
  }

  static getHijriMonthName(month) {
    const months = [
      "Muharram",
      "Safar",
      "Rabi' al-awwal",
      "Rabi' al-thani",
      "Jumada al-awwal",
      "Jumada al-thani",
      "Rajab",
      "Sha'ban",
      "Ramadan",
      "Shawwal",
      "Dhu al-Qi'dah",
      "Dhu al-Hijjah",
    ];

    return months[month - 1] || "Unknown";
  }

  static formatHijriDate(hijriDate) {
    const day = hijriDate.getDate();
    const month = this.getHijriMonthName(hijriDate.getMonth() + 1);
    const year = hijriDate.getFullYear();

    return `${day} ${month} ${year} AH`;
  }

  static isRamadan(date = new Date()) {
    try {
      const hijriDate = new HijriDate(date);
      return hijriDate.getMonth() + 1 === 9; // Ramadan is the 9th month
    } catch (error) {
      console.error("Error checking if Ramadan:", error);
      return false;
    }
  }

  static getDaysUntilRamadan(date = new Date()) {
    try {
      const currentHijri = new HijriDate(date);
      const currentMonth = currentHijri.getMonth() + 1;
      const currentYear = currentHijri.getFullYear();

      if (currentMonth === 9) {
        return 0; // Already in Ramadan
      }

      let ramadanYear = currentYear;
      if (currentMonth > 9) {
        ramadanYear += 1; // Next year's Ramadan
      }

      // Create Hijri date for 1st of Ramadan
      const ramadanHijri = new HijriDate();
      ramadanHijri.setFullYear(ramadanYear, 8, 1); // Month 8 = Ramadan (0-based)

      const ramadanGregorian = ramadanHijri.toGregorian();
      const diffTime = ramadanGregorian - date;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch (error) {
      console.error("Error calculating days until Ramadan:", error);
      return null;
    }
  }

  static getIslamicHolidays() {
    return [
      {
        name: "Islamic New Year",
        hijriMonth: 1,
        hijriDay: 1,
        description: "Beginning of the Islamic calendar year",
      },
      {
        name: "Day of Ashura",
        hijriMonth: 1,
        hijriDay: 10,
        description: "Day of remembrance in Islam",
      },
      {
        name: "Mawlid an-Nabi",
        hijriMonth: 3,
        hijriDay: 12,
        description: "Birth of Prophet Muhammad (PBUH)",
      },
      {
        name: "Laylat al-Mi'raj",
        hijriMonth: 7,
        hijriDay: 27,
        description: "Night Journey of Prophet Muhammad (PBUH)",
      },
      {
        name: "Laylat al-Bara'at",
        hijriMonth: 8,
        hijriDay: 15,
        description: "Night of Forgiveness",
      },
      {
        name: "Start of Ramadan",
        hijriMonth: 9,
        hijriDay: 1,
        description: "Beginning of the holy month of fasting",
      },
      {
        name: "Laylat al-Qadr",
        hijriMonth: 9,
        hijriDay: 27,
        description: "Night of Power (approximate date)",
      },
      {
        name: "Eid al-Fitr",
        hijriMonth: 10,
        hijriDay: 1,
        description: "Festival of Breaking the Fast",
      },
      {
        name: "Eid al-Adha",
        hijriMonth: 12,
        hijriDay: 10,
        description: "Festival of Sacrifice",
      },
    ];
  }

  static getUpcomingHolidays(date = new Date(), limit = 3) {
    try {
      const currentHijri = new HijriDate(date);
      const currentYear = currentHijri.getFullYear();
      const holidays = this.getIslamicHolidays();

      const upcomingHolidays = [];

      // Check holidays in current year and next year
      for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
        const year = currentYear + yearOffset;

        for (const holiday of holidays) {
          try {
            const holidayHijri = new HijriDate();
            holidayHijri.setFullYear(
              year,
              holiday.hijriMonth - 1,
              holiday.hijriDay
            );
            const holidayGregorian = holidayHijri.toGregorian();

            if (holidayGregorian >= date) {
              upcomingHolidays.push({
                ...holiday,
                date: holidayGregorian,
                hijriYear: year,
                daysUntil: Math.ceil(
                  (holidayGregorian - date) / (1000 * 60 * 60 * 24)
                ),
              });
            }
          } catch (error) {
            console.error("Error calculating holiday date:", error);
          }
        }
      }

      // Sort by date and return limited results
      return upcomingHolidays.sort((a, b) => a.date - b.date).slice(0, limit);
    } catch (error) {
      console.error("Error getting upcoming holidays:", error);
      return [];
    }
  }
}
