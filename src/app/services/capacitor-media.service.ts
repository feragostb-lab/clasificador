import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GpsCoordinates } from '../models';

/**
 * Video recording options
 */
export interface VideoRecordingOptions {
  /** Maximum duration in seconds */
  maxDuration?: number;
  
  /** Video quality (0-100) */
  quality?: number;
  
  /** Enable audio recording */
  audio?: boolean;
}

/**
 * Video recording result
 */
export interface VideoRecording {
  /** Path to the recorded video file */
  filePath: string;
  
  /** Duration in seconds */
  duration: number;
  
  /** File size in bytes */
  fileSize: number;
  
  /** Timestamp when recording started */
  timestamp: number;
}

/**
 * Audio recording options
 */
export interface AudioRecordingOptions {
  /** Maximum duration in seconds */
  maxDuration?: number;
  
  /** Sample rate in Hz */
  sampleRate?: number;
  
  /** Number of audio channels (1 for mono, 2 for stereo) */
  channels?: number;
}

/**
 * Audio recording result
 */
export interface AudioRecording {
  /** Path to the recorded audio file */
  filePath: string;
  
  /** Duration in seconds */
  duration: number;
  
  /** File size in bytes */
  fileSize: number;
  
  /** Timestamp when recording started */
  timestamp: number;
}

/**
 * Media capture error types
 */
export enum MediaErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DEVICE_NOT_AVAILABLE = 'DEVICE_NOT_AVAILABLE',
  RECORDING_FAILED = 'RECORDING_FAILED',
  GPS_UNAVAILABLE = 'GPS_UNAVAILABLE',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for media operations
 */
export class MediaError extends Error {
  constructor(
    public type: MediaErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'MediaError';
  }
}

/**
 * Service for handling Capacitor media capture (video, audio, GPS)
 * Implements comprehensive error handling as per requirements
 */
@Injectable({
  providedIn: 'root'
})
export class CapacitorMediaService {
  
  constructor() { }

  /**
   * Request and check camera permissions
   * @returns Observable<boolean> indicating if permissions are granted
   */
  public checkCameraPermissions(): Observable<boolean> {
    return from(Camera.checkPermissions()).pipe(
      map(permissions => permissions.camera === 'granted' && permissions.photos === 'granted'),
      catchError(error => {
        console.error('Error checking camera permissions:', error);
        return throwError(() => new MediaError(
          MediaErrorType.PERMISSION_DENIED,
          'Failed to check camera permissions',
          error
        ));
      })
    );
  }

  /**
   * Request camera permissions from the user
   * @returns Observable<boolean> indicating if permissions were granted
   */
  public requestCameraPermissions(): Observable<boolean> {
    return from(Camera.requestPermissions()).pipe(
      map(permissions => permissions.camera === 'granted' && permissions.photos === 'granted'),
      catchError(error => {
        console.error('Error requesting camera permissions:', error);
        return throwError(() => new MediaError(
          MediaErrorType.PERMISSION_DENIED,
          'Camera permissions denied by user',
          error
        ));
      })
    );
  }

  /**
   * Capture a photo using the device camera
   * @returns Observable<string> containing the photo file path
   */
  public capturePhoto(): Observable<string> {
    return from(
      Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        saveToGallery: false
      })
    ).pipe(
      map(photo => {
        if (!photo.webPath) {
          throw new Error('Photo capture did not return a valid path');
        }
        return photo.webPath;
      }),
      catchError(error => {
        console.error('Error capturing photo:', error);
        return throwError(() => new MediaError(
          MediaErrorType.RECORDING_FAILED,
          'Failed to capture photo',
          error
        ));
      })
    );
  }

  /**
   * Start video recording with optional audio
   * Note: Capacitor doesn't have native video recording, this is a placeholder
   * for native plugin implementation
   * @param options Video recording options
   * @returns Observable<VideoRecording> containing recording details
   */
  public startVideoRecording(options?: VideoRecordingOptions): Observable<VideoRecording> {
    // This would integrate with a native Capacitor plugin for video recording
    // For now, returning a mock implementation signature
    return throwError(() => new MediaError(
      MediaErrorType.DEVICE_NOT_AVAILABLE,
      'Video recording requires native plugin implementation',
      null
    ));
  }

  /**
   * Stop current video recording
   * @returns Observable<VideoRecording> with the completed recording details
   */
  public stopVideoRecording(): Observable<VideoRecording> {
    // This would integrate with a native Capacitor plugin for video recording
    return throwError(() => new MediaError(
      MediaErrorType.DEVICE_NOT_AVAILABLE,
      'Video recording requires native plugin implementation',
      null
    ));
  }

  /**
   * Start audio recording
   * Note: Requires native plugin for audio recording
   * @param options Audio recording options
   * @returns Observable<AudioRecording> containing recording details
   */
  public startAudioRecording(options?: AudioRecordingOptions): Observable<AudioRecording> {
    // This would integrate with a native Capacitor plugin for audio recording
    return throwError(() => new MediaError(
      MediaErrorType.DEVICE_NOT_AVAILABLE,
      'Audio recording requires native plugin implementation',
      null
    ));
  }

  /**
   * Stop current audio recording
   * @returns Observable<AudioRecording> with the completed recording details
   */
  public stopAudioRecording(): Observable<AudioRecording> {
    // This would integrate with a native Capacitor plugin for audio recording
    return throwError(() => new MediaError(
      MediaErrorType.DEVICE_NOT_AVAILABLE,
      'Audio recording requires native plugin implementation',
      null
    ));
  }

  /**
   * Get current GPS position
   * @returns Observable<GpsCoordinates> containing the current location
   */
  public getCurrentPosition(): Observable<GpsCoordinates> {
    return from(
      Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    ).pipe(
      map(position => ({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude ?? undefined,
        accuracy: position.coords.accuracy,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
        timestamp: position.timestamp
      })),
      catchError(error => {
        console.error('Error getting GPS position:', error);
        return throwError(() => new MediaError(
          MediaErrorType.GPS_UNAVAILABLE,
          'Failed to get GPS position',
          error
        ));
      })
    );
  }

  /**
   * Check geolocation permissions
   * @returns Observable<boolean> indicating if permissions are granted
   */
  public checkGeolocationPermissions(): Observable<boolean> {
    return from(Geolocation.checkPermissions()).pipe(
      map(permissions => permissions.location === 'granted'),
      catchError(error => {
        console.error('Error checking geolocation permissions:', error);
        return throwError(() => new MediaError(
          MediaErrorType.PERMISSION_DENIED,
          'Failed to check geolocation permissions',
          error
        ));
      })
    );
  }

  /**
   * Request geolocation permissions from the user
   * @returns Observable<boolean> indicating if permissions were granted
   */
  public requestGeolocationPermissions(): Observable<boolean> {
    return from(Geolocation.requestPermissions()).pipe(
      map(permissions => permissions.location === 'granted'),
      catchError(error => {
        console.error('Error requesting geolocation permissions:', error);
        return throwError(() => new MediaError(
          MediaErrorType.PERMISSION_DENIED,
          'Geolocation permissions denied by user',
          error
        ));
      })
    );
  }

  /**
   * Watch GPS position for continuous updates
   * @returns Observable<GpsCoordinates> that emits position updates
   */
  public watchPosition(): Observable<GpsCoordinates> {
    return new Observable(observer => {
      const watchId = Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        },
        (position, error) => {
          if (error) {
            observer.error(new MediaError(
              MediaErrorType.GPS_UNAVAILABLE,
              'GPS position watch failed',
              error
            ));
            return;
          }
          
          if (position) {
            observer.next({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude ?? undefined,
              accuracy: position.coords.accuracy,
              altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ?? undefined,
              timestamp: position.timestamp
            });
          }
        }
      );

      // Cleanup function
      return () => {
        Geolocation.clearWatch({ id: watchId.toString() }).catch(err => 
          console.error('Error clearing geolocation watch:', err)
        );
      };
    });
  }

  /**
   * Save media file to device storage
   * @param data File data (base64 or blob)
   * @param fileName Name of the file to save
   * @param directory Directory to save to (default: DATA)
   * @returns Observable<string> containing the saved file path
   */
  public saveMediaFile(
    data: string,
    fileName: string,
    directory: Directory = Directory.Data
  ): Observable<string> {
    return from(
      Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: directory,
        recursive: true
      })
    ).pipe(
      map(result => result.uri),
      catchError(error => {
        console.error('Error saving media file:', error);
        return throwError(() => new MediaError(
          MediaErrorType.STORAGE_ERROR,
          'Failed to save media file',
          error
        ));
      })
    );
  }

  /**
   * Read media file from device storage
   * @param filePath Path to the file
   * @param directory Directory to read from (default: DATA)
   * @returns Observable<string> containing the file data
   */
  public readMediaFile(
    filePath: string,
    directory: Directory = Directory.Data
  ): Observable<string> {
    return from(
      Filesystem.readFile({
        path: filePath,
        directory: directory
      })
    ).pipe(
      map(result => typeof result.data === 'string' ? result.data : ''),
      catchError(error => {
        console.error('Error reading media file:', error);
        return throwError(() => new MediaError(
          MediaErrorType.STORAGE_ERROR,
          'Failed to read media file',
          error
        ));
      })
    );
  }

  /**
   * Delete media file from device storage
   * @param filePath Path to the file
   * @param directory Directory to delete from (default: DATA)
   * @returns Observable<void>
   */
  public deleteMediaFile(
    filePath: string,
    directory: Directory = Directory.Data
  ): Observable<void> {
    return from(
      Filesystem.deleteFile({
        path: filePath,
        directory: directory
      })
    ).pipe(
      map(() => undefined),
      catchError(error => {
        console.error('Error deleting media file:', error);
        return throwError(() => new MediaError(
          MediaErrorType.STORAGE_ERROR,
          'Failed to delete media file',
          error
        ));
      })
    );
  }

  /**
   * Check available storage space
   * @returns Observable<number> available space in bytes
   */
  public checkAvailableStorage(): Observable<number> {
    // This would require a native plugin to get actual storage info
    // For now, this is a placeholder signature
    return throwError(() => new MediaError(
      MediaErrorType.DEVICE_NOT_AVAILABLE,
      'Storage check requires native plugin implementation',
      null
    ));
  }
}
