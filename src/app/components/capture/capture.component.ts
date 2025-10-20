import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { 
  CapacitorMediaService, 
  MediaError, 
  MediaErrorType 
} from '../../services/capacitor-media.service';
import { GpsCoordinates } from '../../models';

/**
 * Capture component for recording video, audio, and GPS position
 * Implements OnPush change detection strategy as required
 */
@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CaptureComponent {
  // State signals
  isRecording = signal(false);
  isProcessing = signal(false);
  currentGpsPosition = signal<GpsCoordinates | null>(null);
  lastCapturedPhoto = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private mediaService: CapacitorMediaService) {}

  /**
   * Request necessary permissions
   */
  requestPermissions(): void {
    this.errorMessage.set(null);
    
    // Request camera permissions
    this.mediaService.requestCameraPermissions().pipe(
      catchError(error => {
        this.handleError(error);
        return of(false);
      })
    ).subscribe(granted => {
      if (!granted) {
        this.errorMessage.set('Camera permissions are required');
      }
    });

    // Request geolocation permissions
    this.mediaService.requestGeolocationPermissions().pipe(
      catchError(error => {
        this.handleError(error);
        return of(false);
      })
    ).subscribe(granted => {
      if (!granted) {
        this.errorMessage.set('Geolocation permissions are required');
      }
    });
  }

  /**
   * Start capturing video with audio
   */
  startVideoCapture(): void {
    this.errorMessage.set(null);
    this.isRecording.set(true);

    // Get GPS position
    this.mediaService.getCurrentPosition().pipe(
      catchError(error => {
        this.handleError(error);
        return of(null);
      })
    ).subscribe(position => {
      if (position) {
        this.currentGpsPosition.set(position);
      }
    });

    // Start video recording (placeholder - requires native implementation)
    this.mediaService.startVideoRecording({ audio: true }).pipe(
      catchError(error => {
        this.handleError(error);
        this.isRecording.set(false);
        return of(null);
      })
    ).subscribe(recording => {
      if (recording) {
        console.log('Video recording started:', recording);
      }
    });
  }

  /**
   * Stop video capture
   */
  stopVideoCapture(): void {
    this.isRecording.set(false);

    this.mediaService.stopVideoRecording().pipe(
      catchError(error => {
        this.handleError(error);
        return of(null);
      })
    ).subscribe(recording => {
      if (recording) {
        console.log('Video recording completed:', recording);
      }
    });
  }

  /**
   * Capture a single photo
   */
  capturePhoto(): void {
    this.errorMessage.set(null);
    this.isProcessing.set(true);

    this.mediaService.capturePhoto().pipe(
      catchError(error => {
        this.handleError(error);
        this.isProcessing.set(false);
        return of(null);
      })
    ).subscribe(photoPath => {
      this.isProcessing.set(false);
      if (photoPath) {
        this.lastCapturedPhoto.set(photoPath);
        
        // Get GPS position for the photo
        this.mediaService.getCurrentPosition().pipe(
          catchError(error => {
            this.handleError(error);
            return of(null);
          })
        ).subscribe(position => {
          if (position) {
            this.currentGpsPosition.set(position);
          }
        });
      }
    });
  }

  /**
   * Handle errors with proper error messages
   */
  private handleError(error: any): void {
    if (error instanceof MediaError) {
      switch (error.type) {
        case MediaErrorType.PERMISSION_DENIED:
          this.errorMessage.set('Permission denied. Please enable permissions in settings.');
          break;
        case MediaErrorType.DEVICE_NOT_AVAILABLE:
          this.errorMessage.set('Device feature not available.');
          break;
        case MediaErrorType.RECORDING_FAILED:
          this.errorMessage.set('Recording failed. Please try again.');
          break;
        case MediaErrorType.GPS_UNAVAILABLE:
          this.errorMessage.set('GPS unavailable. Check location services.');
          break;
        case MediaErrorType.STORAGE_ERROR:
          this.errorMessage.set('Storage error. Check available space.');
          break;
        default:
          this.errorMessage.set('An unknown error occurred.');
      }
    } else {
      this.errorMessage.set(error?.message || 'An error occurred');
    }
    console.error('Capture error:', error);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage.set(null);
  }
}
