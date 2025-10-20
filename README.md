# TreeLogger - Tree Identification and Inventory System

TreeLogger is an Android application that records video, audio, and GPS position to identify and catalog trees using TensorFlow Lite AI. Each identified tree includes GPS coordinates and audio transcription, with complete export capabilities.

## 🌳 Features

- **Media Capture**: Record video and audio simultaneously with GPS tracking
- **Audio Processing**: Keyword detection, slicing, and transcription
- **AI-Powered Identification**: TensorFlow Lite tree species identification
- **GPS Integration**: Automatic location tagging with EXIF metadata
- **Smart Processing Pipeline**: Audio → Video frames → EXIF → TFLite → Voting → Storage
- **Export Options**: CSV, JSON, and ZIP archives with images
- **Offline Capable**: All processing happens locally on device

## 🛠 Technology Stack

- **Angular 20**: Standalone components with OnPush change detection
- **Capacitor 7**: Native mobile capabilities
- **TensorFlow Lite**: On-device AI inference
- **TypeScript**: Type-safe development
- **SCSS**: Styled components
- **RxJS**: Reactive programming

## 📋 Requirements

- Node.js 18+ and npm
- Angular CLI
- Android Studio (for Android development)
- Android SDK

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/feragostb-lab/clasificador.git
cd clasificador

# Install dependencies
npm install

# Start development server
npm start
```

The app will be available at `http://localhost:4200`

### Build for Production

```bash
# Build the Angular app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 📱 Application Structure

### Components

1. **Capture Component** (`/capture`)
   - Video/audio recording
   - GPS position tracking
   - Permission management
   - Photo capture

2. **Processing Component** (`/processing`)
   - Audio keyword detection
   - Video frame extraction
   - EXIF metadata embedding
   - TFLite inference
   - Results voting and storage

3. **Findings Component** (`/findings`)
   - List all tree findings
   - Filter by status
   - Detailed finding view
   - Search and geographic filtering

4. **Export Component** (`/export`)
   - CSV export
   - JSON export
   - Images ZIP creation
   - Complete package export

## 🔧 Services

### Core Services

- **CapacitorMediaService**: Camera, audio, and GPS operations
- **AudioProcessorService**: Audio analysis and transcription
- **VideoProcessorService**: Frame extraction from video
- **ImageProcessorService**: EXIF metadata manipulation
- **TfliteInferenceService**: AI model inference
- **TreeFindingService**: Data management
- **ExportService**: Export functionality

For detailed API documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)

## 📊 Data Models

### GpsCoordinates
```typescript
interface GpsCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: number;
}
```

### TreeFinding
```typescript
interface TreeFinding {
  id: string;
  identifications: TreeIdentification[];
  location: GpsCoordinates;
  audioTranscription?: AudioTranscription;
  imageExif: ImageExifData;
  recordedAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
```

See [models documentation](src/app/models/) for complete interface definitions.

## 🔄 Processing Pipeline

```
Capture → Audio Keywords → Video Frames → EXIF Data → TFLite AI → Vote → Store → Export
```

1. **Capture**: Record video/audio with GPS
2. **Audio Keywords**: Detect keywords to identify relevant segments
3. **Video Frames**: Extract frames from identified segments
4. **EXIF Data**: Embed GPS coordinates and timestamps
5. **TFLite AI**: Run tree identification on each frame
6. **Vote**: Aggregate predictions across frames
7. **Store**: Save top 3 identifications
8. **Export**: Generate CSV/JSON and ZIP archives

## 🎯 Key Design Principles

1. **Standalone Components**: No NgModules, fully modular
2. **OnPush Change Detection**: Optimal performance
3. **Comprehensive Error Handling**: Typed errors with recovery
4. **Reactive Programming**: RxJS observables throughout
5. **Type Safety**: Full TypeScript coverage
6. **Offline First**: All processing happens on device

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test -- --code-coverage
```

## 📦 Building for Android

```bash
# Build Angular app
npm run build

# Sync with Capacitor
npx cap sync android

# Add Android platform (if not already added)
npx cap add android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Connect an Android device or start an emulator
3. Click Run (green play button)

## 🔐 Permissions

The app requires the following permissions:

- **Camera**: For capturing photos and video
- **Microphone**: For audio recording
- **Location**: For GPS coordinates
- **Storage**: For saving media files

Permissions are requested at runtime when needed.

## 🗂 Project Structure

```
clasificador/
├── src/
│   └── app/
│       ├── components/         # UI components
│       │   ├── capture/
│       │   ├── processing/
│       │   ├── findings/
│       │   └── export/
│       ├── services/           # Business logic
│       │   ├── capacitor-media.service.ts
│       │   ├── audio-processor.service.ts
│       │   ├── video-processor.service.ts
│       │   ├── image-processor.service.ts
│       │   ├── tflite-inference.service.ts
│       │   ├── tree-finding.service.ts
│       │   └── export.service.ts
│       └── models/              # TypeScript interfaces
│           ├── gps-coordinates.interface.ts
│           └── tree-finding.interface.ts
├── ARCHITECTURE.md             # Detailed architecture docs
├── capacitor.config.ts         # Capacitor configuration
└── package.json                # Dependencies
```

## 🔮 Future Enhancements

- [ ] Cloud sync for findings
- [ ] Offline model updates
- [ ] Real-time video preview
- [ ] Custom model training interface
- [ ] Map view of findings
- [ ] AR tree identification
- [ ] Multi-language support
- [ ] Social media sharing

## 📝 License

See [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Capacitor team for native capabilities
- TensorFlow team for TFLite

---

Built with ❤️ using Angular, Capacitor, and TensorFlow Lite
