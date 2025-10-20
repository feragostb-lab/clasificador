import { GpsCoordinates } from './gps-coordinates.interface';

/**
 * Represents a single tree identification result from TFLite
 */
export interface TreeIdentification {
  /** Tree species name */
  species: string;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** TFLite model version used */
  modelVersion: string;
}

/**
 * Audio transcription data for a specific time segment
 */
export interface AudioTranscription {
  /** Transcribed text */
  text: string;
  
  /** Start time in seconds */
  startTime: number;
  
  /** End time in seconds */
  endTime: number;
  
  /** Detected keywords that triggered the slice */
  keywords: string[];
}

/**
 * EXIF metadata embedded in captured images
 */
export interface ImageExifData {
  /** GPS coordinates where image was captured */
  gpsCoordinates: GpsCoordinates;
  
  /** Timestamp when image was captured */
  timestamp: number;
  
  /** Image file path or identifier */
  imagePath: string;
  
  /** Image width in pixels */
  width?: number;
  
  /** Image height in pixels */
  height?: number;
  
  /** Camera make and model (optional) */
  cameraInfo?: string;
}

/**
 * Complete tree finding record with all associated data
 */
export interface TreeFinding {
  /** Unique identifier for this finding */
  id: string;
  
  /** Top 3 tree identifications from TFLite (ordered by confidence) */
  identifications: TreeIdentification[];
  
  /** GPS coordinates where the tree was found */
  location: GpsCoordinates;
  
  /** Audio transcription for this finding (optional) */
  audioTranscription?: AudioTranscription;
  
  /** EXIF data from the captured image */
  imageExif: ImageExifData;
  
  /** Timestamp when the finding was recorded */
  recordedAt: number;
  
  /** Processing status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  /** Error message if processing failed */
  errorMessage?: string;
}

/**
 * Export data structure for CSV generation
 */
export interface TreeFindingExport {
  /** Finding ID */
  id: string;
  
  /** First species identification */
  species1: string;
  confidence1: number;
  
  /** Second species identification */
  species2?: string;
  confidence2?: number;
  
  /** Third species identification */
  species3?: string;
  confidence3?: number;
  
  /** Latitude */
  latitude: number;
  
  /** Longitude */
  longitude: number;
  
  /** Altitude */
  altitude?: number;
  
  /** Timestamp */
  timestamp: number;
  
  /** Audio transcription text */
  transcription?: string;
  
  /** Image file name */
  imageFileName: string;
}
