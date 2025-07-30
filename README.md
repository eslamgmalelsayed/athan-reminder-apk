# 🕌 Athan Reminder

A beautiful and accurate Islamic prayer times reminder app built with React Native and Expo.

## ✨ Features

- **Accurate Prayer Times**: Uses the `adhan` library with Muslim World League calculation method
- **Location-Based**: Automatically detects your location or allows manual location setting
- **Smart Notifications**: Prayer time reminders with customizable settings
- **Islamic Calendar**: Hijri calendar with upcoming Islamic holidays and events
- **Ramadan Support**: Special Ramadan awareness and countdown features
- **Clean UI**: Modern, respectful interface with Islamic design principles
- **Offline Support**: Cached prayer times and settings work without internet

## 📱 Screenshots

_Screenshots will be added once the app is running_

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Athan-Reminder
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your device or simulator**
   - For iOS: `npm run ios`
   - For Android: `npm run android`
   - For Web: `npm run web`
   - Or scan the QR code with Expo Go app

## 🔧 Configuration

### Prayer Time Calculation

The app uses the **Muslim World League** calculation method by default, which is widely accepted globally. You can modify this in `src/services/PrayerTimeService.js` if needed.

### Location Permissions

The app requires location permissions to calculate accurate prayer times:

- **iOS**: Location permission is requested automatically
- **Android**: Location permission is requested automatically

### Notifications

To receive prayer time notifications:

1. Grant notification permissions when prompted
2. Enable background app refresh (iOS)
3. Disable battery optimization for the app (Android)

## 📋 App Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
│   ├── HomeScreen.js   # Prayer times and countdown
│   ├── CalendarScreen.js # Islamic calendar and events
│   └── SettingsScreen.js # App settings and preferences
├── services/           # Core app services
│   ├── PrayerTimeService.js  # Prayer time calculations
│   ├── LocationService.js    # Location handling
│   ├── NotificationService.js # Notification management
│   └── StorageService.js     # Local data storage
├── utils/              # Utility functions
│   └── HijriCalendarUtils.js # Islamic calendar utilities
└── navigation/         # App navigation
    └── AppNavigator.js # Bottom tab navigation
```

## 🕒 Prayer Times

The app calculates and displays:

- **Fajr** (Dawn Prayer)
- **Dhuhr** (Noon Prayer)
- **Asr** (Afternoon Prayer)
- **Maghrib** (Sunset Prayer)
- **Isha** (Night Prayer)
- **Sunrise** (for reference)

## 🌙 Islamic Calendar Features

- Hijri date display
- Upcoming Islamic holidays and events
- Ramadan detection and countdown
- Monthly prayer time calendar
- Important Islamic dates notifications

## 📱 Notifications

- Prayer time notifications
- Configurable reminder times (default: 10 minutes before)
- Individual prayer notification toggles
- Background notifications support
- Custom notification sounds and vibration

## 🛠 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run build` - Build for production

### Dependencies

**Core Dependencies:**

- `expo` - React Native development platform
- `react-navigation` - Navigation library
- `adhan` - Islamic prayer time calculations
- `expo-location` - Location services
- `expo-notifications` - Push notifications
- `moment` - Date manipulation
- `hijri-date` - Islamic calendar

**UI Dependencies:**

- `@expo/vector-icons` - Icon library
- `react-native-safe-area-context` - Safe area handling
- `react-native-screens` - Native screen handling

## 🤲 Islamic Compliance

This app is designed with respect for Islamic principles:

- Accurate prayer time calculations using established methods
- Respectful Islamic terminology and language
- Privacy-focused (location data stays on device)
- No inappropriate content or advertising
- Clean, modest interface design

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](issues).

## 📞 Support

If you have any questions or need support:

- Create an issue on GitHub
- Contact the developer

## 🙏 Acknowledgments

- **Adhan Library**: For accurate Islamic prayer time calculations
- **Muslim World League**: For the calculation methodology
- **Islamic Community**: For guidance on proper Islamic app development
- **Expo Team**: For the excellent React Native development platform

---

**May Allah accept our prayers and grant us success in this life and the hereafter. Ameen.** 🤲

_"And establish prayer and give zakah and bow with those who bow."_ - Quran 2:43
