import * as Location from "expo-location";

export class LocationService {
  static async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return false;
    }
  }

  static async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();

      if (!hasPermission) {
        throw new Error("Location permission not granted");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      throw error;
    }
  }

  static async reverseGeocode(latitude, longitude) {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const location = result[0];
        return {
          city: location.city || location.subregion || "Unknown City",
          region:
            location.region || location.administrativeArea || "Unknown Region",
          country: location.country || "Unknown Country",
        };
      }

      return null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  }

  static async getLocationName(latitude, longitude) {
    const geocode = await this.reverseGeocode(latitude, longitude);
    if (geocode) {
      return `${geocode.city}, ${geocode.country}`;
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}
