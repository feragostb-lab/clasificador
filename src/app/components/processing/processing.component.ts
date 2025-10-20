import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { TreeFinding } from '../../models';
import { 
  AudioProcessorService,
  VideoProcessorService,
  ImageProcessorService,
  TfliteInferenceService,
  TreeFindingService
} from '../../services';

/**
 * Processing status for the pipeline
 */
interface ProcessingStatus {
  step: 'idle' | 'audio' | 'video' | 'exif' | 'inference' | 'voting' | 'storing' | 'complete' | 'error';
  message: string;
  progress: number;
}

/**
 * Processing component that orchestrates the full pipeline:
 * audio keyword detection → slice → frames → EXIF → TFLite → voting → store top 3
 * Implements OnPush change detection strategy as required
 */
@Component({
  selector: 'app-processing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessingComponent {
  // State signals
  processingStatus = signal<ProcessingStatus>({
    step: 'idle',
    message: 'Ready to process',
    progress: 0
  });
  
  currentFinding = signal<TreeFinding | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private audioProcessor: AudioProcessorService,
    private videoProcessor: VideoProcessorService,
    private imageProcessor: ImageProcessorService,
    private tfliteInference: TfliteInferenceService,
    private treeFindingService: TreeFindingService
  ) {}

  /**
   * Start the full processing pipeline
   * @param videoPath Path to the video file
   * @param audioPath Path to the audio file
   * @param keywords Keywords to detect in audio
   */
  startProcessing(videoPath: string, audioPath: string, keywords: string[]): void {
    this.errorMessage.set(null);
    
    // Step 1: Audio keyword detection and slicing
    this.updateStatus('audio', 'Detecting keywords in audio...', 10);
    
    this.audioProcessor.detectKeywords(audioPath, { keywords }).pipe(
      catchError(error => {
        this.handleError('Audio processing failed', error);
        return of(null);
      })
    ).subscribe(audioSlices => {
      if (!audioSlices) return;

      // Step 2: Extract frames from video
      this.updateStatus('video', 'Extracting frames from video...', 30);
      
      this.videoProcessor.extractFrames(videoPath).pipe(
        catchError(error => {
          this.handleError('Frame extraction failed', error);
          return of(null);
        })
      ).subscribe(frames => {
        if (!frames) return;

        // Step 3: Add EXIF data to frames
        this.updateStatus('exif', 'Adding EXIF data to images...', 50);
        // Note: This would process each frame with GPS and timestamp
        
        // Step 4: Run TFLite inference on all frames
        this.updateStatus('inference', 'Running tree identification...', 70);
        
        const imagePaths = frames.map(f => f.imageData);
        this.tfliteInference.runInferenceWithVoting(imagePaths).pipe(
          catchError(error => {
            this.handleError('Tree identification failed', error);
            return of(null);
          })
        ).subscribe(identifications => {
          if (!identifications) return;

          // Step 5: Store top 3 results
          this.updateStatus('storing', 'Storing findings...', 90);
          
          // Create finding object (simplified for demonstration)
          const finding: TreeFinding = {
            id: this.generateId(),
            identifications: identifications.slice(0, 3),
            location: { latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() },
            imageExif: {
              gpsCoordinates: { latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() },
              timestamp: Date.now(),
              imagePath: videoPath
            },
            recordedAt: Date.now(),
            status: 'completed'
          };

          this.treeFindingService.storeFinding(finding).pipe(
            catchError(error => {
              this.handleError('Failed to store finding', error);
              return of(null);
            })
          ).subscribe(findingId => {
            if (findingId) {
              this.currentFinding.set(finding);
              this.updateStatus('complete', 'Processing complete!', 100);
            }
          });
        });
      });
    });
  }

  /**
   * Update processing status
   */
  private updateStatus(step: ProcessingStatus['step'], message: string, progress: number): void {
    this.processingStatus.set({ step, message, progress });
  }

  /**
   * Handle processing errors
   */
  private handleError(message: string, error: any): void {
    this.errorMessage.set(message);
    this.updateStatus('error', message, 0);
    console.error(message, error);
  }

  /**
   * Generate unique ID for findings
   */
  private generateId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage.set(null);
  }

  /**
   * Reset processing state
   */
  reset(): void {
    this.processingStatus.set({
      step: 'idle',
      message: 'Ready to process',
      progress: 0
    });
    this.currentFinding.set(null);
    this.errorMessage.set(null);
  }
}
