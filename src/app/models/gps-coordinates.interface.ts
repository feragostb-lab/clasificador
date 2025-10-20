/**
 * GPS coordinates interface for geolocation data
 */
export interface GpsCoordinates {
  /** Latitude in decimal degrees */
  latitude: number;
  
  /** Longitude in decimal degrees */
  longitude: number;
  
  /** Altitude in meters above sea level (optional) */
  altitude?: number;
  
  /** Accuracy of the position in meters */
  accuracy: number;
  
  /** Accuracy of the altitude in meters (optional) */
  altitudeAccuracy?: number;
  
  /** Direction of travel in degrees (0-360, optional) */
  heading?: number;
  
  /** Speed in meters per second (optional) */
  speed?: number;
  
  /** Timestamp when the position was acquired */
  timestamp: number;
}
