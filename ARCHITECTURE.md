# TreeLogger Application Architecture

## Overview
TreeLogger is an Android application built with Angular, Capacitor, and TensorFlow Lite that records video, audio, and GPS position to identify and inventory trees.

## Technology Stack
- **Frontend Framework**: Angular 20 (Standalone Components)
- **Mobile Framework**: Capacitor 7
- **AI/ML**: TensorFlow Lite
- **Language**: TypeScript
- **Styling**: SCSS

## Design Principles
1. **Angular Standalone Components**: All components are standalone (no NgModules)
2. **OnPush Change Detection**: All components use `ChangeDetectionStrategy.OnPush` for optimal performance
3. **Comprehensive Error Handling**: All services implement proper error handling with typed error classes

## Project Structure

```
src/app/
├── models/                          # TypeScript interfaces
│   ├── gps-coordinates.interface.ts
│   ├── tree-finding.interface.ts
│   └── index.ts
├── services/                        # Business logic services
│   ├── capacitor-media.service.ts
│   ├── audio-processor.service.ts
│   ├── video-processor.service.ts
│   ├── image-processor.service.ts
│   ├── tflite-inference.service.ts
│   ├── tree-finding.service.ts
│   ├── export.service.ts
│   └── index.ts
├── components/                      # UI components
│   ├── capture/
│   │   ├── capture.component.ts
│   │   ├── capture.component.html
│   │   └── capture.component.scss
│   ├── processing/
│   │   ├── processing.component.ts
│   │   ├── processing.component.html
│   │   └── processing.component.scss
│   ├── findings/
│   │   ├── findings-list.component.ts
│   │   ├── findings-list.component.html
│   │   └── findings-list.component.scss
│   └── export/
│       ├── export.component.ts
│       ├── export.component.html
│       └── export.component.scss
├── app.ts                          # Main app component
├── app.html
├── app.scss
├── app.config.ts
└── app.routes.ts
```

## TypeScript Interfaces

### GpsCoordinates
Represents GPS location data with comprehensive positioning information.

**Properties:**
- `latitude: number` - Latitude in decimal degrees
- `longitude: number` - Longitude in decimal degrees
- `altitude?: number` - Altitude in meters above sea level
- `accuracy: number` - Position accuracy in meters
- `altitudeAccuracy?: number` - Altitude accuracy in meters
- `heading?: number` - Direction of travel (0-360 degrees)
- `speed?: number` - Speed in meters per second
- `timestamp: number` - Position acquisition timestamp

### TreeFinding
Complete tree finding record with all associated data.

**Properties:**
- `id: string` - Unique identifier
- `identifications: TreeIdentification[]` - Top 3 tree identifications from TFLite
- `location: GpsCoordinates` - GPS coordinates where found
- `audioTranscription?: AudioTranscription` - Audio transcription data
- `imageExif: ImageExifData` - EXIF data from captured image
- `recordedAt: number` - Recording timestamp
- `status: 'pending' | 'processing' | 'completed' | 'failed'` - Processing status
- `errorMessage?: string` - Error message if failed

### Related Interfaces
- `TreeIdentification` - Individual tree species identification with confidence score
- `AudioTranscription` - Audio transcription with keywords and time range
- `ImageExifData` - Image metadata with GPS and timestamp
- `TreeFindingExport` - Flattened format for CSV export

## Services

### 1. CapacitorMediaService
**Purpose**: Handle Capacitor media capture (video, audio, GPS)

**Key Methods:**
- `checkCameraPermissions(): Observable<boolean>`
- `requestCameraPermissions(): Observable<boolean>`
- `capturePhoto(): Observable<string>`
- `startVideoRecording(options?: VideoRecordingOptions): Observable<VideoRecording>`
- `stopVideoRecording(): Observable<VideoRecording>`
- `startAudioRecording(options?: AudioRecordingOptions): Observable<AudioRecording>`
- `stopAudioRecording(): Observable<AudioRecording>`
- `getCurrentPosition(): Observable<GpsCoordinates>`
- `checkGeolocationPermissions(): Observable<boolean>`
- `requestGeolocationPermissions(): Observable<boolean>`
- `watchPosition(): Observable<GpsCoordinates>`
- `saveMediaFile(data: string, fileName: string, directory?: Directory): Observable<string>`
- `readMediaFile(filePath: string, directory?: Directory): Observable<string>`
- `deleteMediaFile(filePath: string, directory?: Directory): Observable<void>`

**Error Handling:**
- Custom `MediaError` class with typed error codes
- Error types: `PERMISSION_DENIED`, `DEVICE_NOT_AVAILABLE`, `RECORDING_FAILED`, `GPS_UNAVAILABLE`, `STORAGE_ERROR`, `UNKNOWN_ERROR`

### 2. AudioProcessorService
**Purpose**: Process audio for keyword detection, slicing, and transcription

**Key Methods:**
- `detectKeywords(audioFilePath: string, options: AudioProcessingOptions): Observable<AudioSlice[]>`
- `sliceAudio(audioFilePath: string, startTime: number, endTime: number): Observable<string>`
- `transcribeAudio(audioFilePath: string, language?: string): Observable<AudioTranscription>`
- `processAudio(audioFilePath: string, options: AudioProcessingOptions): Observable<AudioTranscription[]>`

**Note:** Requires native plugin implementation for full functionality

### 3. VideoProcessorService
**Purpose**: Extract frames from video files

**Key Methods:**
- `extractFrames(videoFilePath: string, options?: FrameExtractionOptions): Observable<VideoFrame[]>`
- `extractFrameAtTime(videoFilePath: string, timestamp: number, options?: FrameExtractionOptions): Observable<VideoFrame>`
- `getVideoDuration(videoFilePath: string): Observable<number>`
- `getVideoMetadata(videoFilePath: string): Observable<any>`

**Note:** Requires native plugin implementation for full functionality

### 4. ImageProcessorService
**Purpose**: Add and read EXIF metadata from images

**Key Methods:**
- `addExifData(imagePath: string, options: ExifWriteOptions): Observable<string>`
- `readExifData(imagePath: string): Observable<ImageExifData>`
- `generateThumbnail(imagePath: string, maxWidth?: number, maxHeight?: number): Observable<string>`
- `compressImage(imagePath: string, quality?: number): Observable<string>`

**Note:** Requires native plugin implementation for full functionality

### 5. TfliteInferenceService
**Purpose**: Run TensorFlow Lite model inference for tree identification

**Key Methods:**
- `loadModel(modelPath: string, labelsPath?: string): Observable<TFLiteModel>`
- `runInference(imagePath: string, options?: InferenceOptions): Observable<TreeIdentification[]>`
- `runInferenceWithVoting(imagePaths: string[], options?: InferenceOptions): Observable<TreeIdentification[]>`
- `preprocessImage(imagePath: string): Observable<string>`
- `getCurrentModel(): TFLiteModel | null`
- `unloadModel(): Observable<void>`

**Note:** Requires native TFLite plugin implementation

### 6. TreeFindingService
**Purpose**: Manage tree findings storage and retrieval

**Key Methods:**
- `storeFinding(finding: TreeFinding): Observable<string>`
- `getFinding(id: string): Observable<TreeFinding>`
- `getAllFindings(): Observable<TreeFinding[]>`
- `getFindingsByStatus(status: TreeFinding['status']): Observable<TreeFinding[]>`
- `updateFinding(id: string, updates: Partial<TreeFinding>): Observable<TreeFinding>`
- `deleteFinding(id: string): Observable<void>`
- `clearAllFindings(): Observable<void>`
- `searchBySpecies(species: string): Observable<TreeFinding[]>`
- `getFindingsInArea(center: GpsCoordinates, radiusKm: number): Observable<TreeFinding[]>`
- `convertToExportFormat(findings: TreeFinding[]): TreeFindingExport[]`

### 7. ExportService
**Purpose**: Export findings to CSV/JSON and create ZIP archives

**Key Methods:**
- `exportToCSV(findings: TreeFinding[], options?: Partial<ExportOptions>): Observable<ExportResult>`
- `exportToJSON(findings: TreeFinding[], options?: Partial<ExportOptions>): Observable<ExportResult>`
- `createImagesZip(imagePaths: string[], options?: Partial<ExportOptions>): Observable<string>`
- `exportCompletePackage(findings: TreeFinding[], options?: Partial<ExportOptions>): Observable<ExportResult>`
- `shareExport(filePath: string): Observable<void>`

## Components

### 1. CaptureComponent
**Route**: `/capture`  
**Purpose**: Record video, audio, and capture GPS position

**Features:**
- Request camera and geolocation permissions
- Capture photos with automatic GPS tagging
- Start/stop video recording with audio
- Display current GPS position
- Real-time permission status checking
- Error handling with user-friendly messages

**Change Detection**: `OnPush`

### 2. ProcessingComponent
**Route**: `/processing`  
**Purpose**: Orchestrate the full processing pipeline

**Pipeline Steps:**
1. Audio keyword detection and slicing
2. Extract frames from video
3. Add EXIF data (GPS, timestamp) to images
4. Run TFLite tree identification
5. Vote and select top 3 identifications
6. Store findings

**Features:**
- Visual progress indicator
- Step-by-step status display
- Error handling at each pipeline stage
- Display processed findings

**Change Detection**: `OnPush`

### 3. FindingsListComponent
**Route**: `/findings`  
**Purpose**: Display and manage stored tree findings

**Features:**
- List all findings with filtering by status
- Detailed view of selected finding
- Search by species
- Delete findings
- Geographic filtering
- Real-time updates

**Change Detection**: `OnPush`

### 4. ExportComponent
**Route**: `/export`  
**Purpose**: Export findings to various formats

**Export Options:**
- CSV format (flattened data)
- JSON format (complete objects)
- Images ZIP (with EXIF metadata)
- Complete package (data + images)

**Features:**
- Configurable export options
- Summary statistics
- Success/error notifications
- File name customization

**Change Detection**: `OnPush`

## Processing Pipeline

The complete data flow from capture to export:

```
1. CAPTURE
   └─> Video + Audio + GPS captured simultaneously
       └─> Stored in local filesystem

2. AUDIO PROCESSING
   └─> Keyword detection in audio
       └─> Time segments identified
           └─> Audio sliced at keyword timestamps

3. VIDEO PROCESSING
   └─> Frames extracted from video
       └─> Based on audio keyword timestamps
           └─> Images saved to filesystem

4. IMAGE ENHANCEMENT
   └─> EXIF data added to each frame
       └─> GPS coordinates embedded
           └─> Timestamp embedded
               └─> Camera info added

5. AI INFERENCE
   └─> TFLite model loaded
       └─> Each image processed
           └─> Species predictions generated
               └─> Confidence scores calculated

6. VOTING & AGGREGATION
   └─> All predictions collected
       └─> Voting algorithm applied
           └─> Top 3 species selected
               └─> Sorted by confidence

7. STORAGE
   └─> TreeFinding object created
       └─> Stored in service
           └─> Available for export

8. EXPORT
   └─> CSV/JSON generated
       └─> Images ZIP created
           └─> Complete package available
```

## Error Handling

All services implement comprehensive error handling:

1. **Typed Errors**: Custom error classes with specific error types
2. **Observable Error Handling**: All observables use `catchError` operator
3. **User-Friendly Messages**: Error messages translated for UI display
4. **Logging**: All errors logged to console for debugging
5. **Recovery**: Graceful degradation when features unavailable

## Native Plugin Requirements

Some functionality requires native Capacitor plugins:

- **Video Recording**: Custom plugin for video capture with audio
- **Audio Recording**: Custom plugin for audio capture
- **Audio Processing**: Native audio analysis for keyword detection
- **Video Processing**: Native video frame extraction
- **Image Processing**: Native EXIF manipulation
- **TFLite**: Native TensorFlow Lite integration
- **ZIP Creation**: Native file compression

## Future Enhancements

1. Offline model updates
2. Cloud sync for findings
3. Advanced audio keyword detection with ML
4. Real-time video preview during capture
5. Custom TFLite model training interface
6. Share findings directly to social media
7. Map view of all findings
8. Batch processing of multiple videos
9. Augmented reality tree identification
10. Multi-language support

## Testing Strategy

1. **Unit Tests**: All services with mocked dependencies
2. **Component Tests**: UI components with fixture testing
3. **Integration Tests**: End-to-end pipeline testing
4. **E2E Tests**: User flow testing with Protractor/Cypress
5. **Performance Tests**: Memory and CPU profiling
6. **Accessibility Tests**: WCAG compliance

## Build & Deployment

```bash
# Development
npm start

# Production build
npm run build

# Android build
npx cap sync android
npx cap open android

# Tests
npm test
```

## License

See LICENSE file for details.
