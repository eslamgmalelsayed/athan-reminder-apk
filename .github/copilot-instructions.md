# Copilot Instructions for Athan-Reminder

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a React Native Expo project for an Islamic prayer times reminder app called "Athan-Reminder".

## Project Context

- **App Purpose**: Personal Islamic prayer times reminder application
- **Target Platform**: Mobile (iOS/Android) using React Native with Expo
- **Core Features**: Prayer time calculations, location-based times, notifications, Hijri calendar

## Key Dependencies

- **Navigation**: @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs
- **Prayer Times**: adhan library for accurate Islamic prayer time calculations
- **Location**: expo-location for getting user's geographic coordinates
- **Notifications**: expo-notifications for prayer time reminders
- **Calendar**: hijri-date for Islamic calendar functionality
- **Date/Time**: moment for date manipulation

## Code Style Guidelines

- Use functional components with React hooks
- Follow Islamic terminology accurately (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Implement proper error handling for location and notification permissions
- Use Arabic/Islamic naming conventions where appropriate
- Ensure respectful and accurate Islamic content

## Architecture

- Screen-based navigation with bottom tabs
- Centralized prayer time calculations
- Local storage for user preferences and settings
- Background notifications for prayer times
- Location-aware prayer time adjustments

## Islamic Prayer Times

- Fajr (Dawn Prayer)
- Dhuhr (Noon Prayer)
- Asr (Afternoon Prayer)
- Maghrib (Sunset Prayer)
- Isha (Night Prayer)

Please generate code that is respectful to Islamic practices and uses accurate prayer time calculations.
