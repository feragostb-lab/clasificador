import { Injectable } from '@angular/core';
import { Observable, throwError, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TreeFinding, TreeFindingExport } from '../models';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

/**
 * Export format options
 */
export interface ExportOptions {
  /** Include images in export */
  includeImages?: boolean;
  
  /** Include audio files in export */
  includeAudio?: boolean;
  
  /** Export format */
  format: 'csv' | 'json';
  
  /** File name prefix */
  fileNamePrefix?: string;
}

/**
 * Export result
 */
export interface ExportResult {
  /** Path to the exported file (CSV or JSON) */
  dataFilePath: string;
  
  /** Path to the ZIP file containing images (if includeImages is true) */
  imagesZipPath?: string;
  
  /** Number of findings exported */
  findingsCount: number;
  
  /** Export timestamp */
  exportedAt: number;
}

/**
 * Service for exporting tree findings to CSV/JSON and creating ZIP archives
 */
@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Export findings to CSV format
   * @param findings Array of findings to export
   * @param options Export options
   * @returns Observable<ExportResult> export result information
   */
  public exportToCSV(
    findings: TreeFinding[],
    options?: Partial<ExportOptions>
  ): Observable<ExportResult> {
    try {
      const csvContent = this.generateCSV(findings);
      const timestamp = Date.now();
      const fileName = `${options?.fileNamePrefix || 'tree-findings'}_${timestamp}.csv`;

      return from(
        Filesystem.writeFile({
          path: fileName,
          data: csvContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true
        })
      ).pipe(
        map(result => ({
          dataFilePath: result.uri,
          findingsCount: findings.length,
          exportedAt: timestamp
        })),
        catchError(error => {
          console.error('Error exporting to CSV:', error);
          return throwError(() => new Error(`Failed to export CSV: ${error}`));
        })
      );
    } catch (error) {
      return throwError(() => new Error(`Failed to generate CSV: ${error}`));
    }
  }

  /**
   * Export findings to JSON format
   * @param findings Array of findings to export
   * @param options Export options
   * @returns Observable<ExportResult> export result information
   */
  public exportToJSON(
    findings: TreeFinding[],
    options?: Partial<ExportOptions>
  ): Observable<ExportResult> {
    try {
      const jsonContent = JSON.stringify(findings, null, 2);
      const timestamp = Date.now();
      const fileName = `${options?.fileNamePrefix || 'tree-findings'}_${timestamp}.json`;

      return from(
        Filesystem.writeFile({
          path: fileName,
          data: jsonContent,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true
        })
      ).pipe(
        map(result => ({
          dataFilePath: result.uri,
          findingsCount: findings.length,
          exportedAt: timestamp
        })),
        catchError(error => {
          console.error('Error exporting to JSON:', error);
          return throwError(() => new Error(`Failed to export JSON: ${error}`));
        })
      );
    } catch (error) {
      return throwError(() => new Error(`Failed to generate JSON: ${error}`));
    }
  }

  /**
   * Create a ZIP archive of images with EXIF data
   * @param imagePaths Array of image file paths
   * @param options Export options
   * @returns Observable<string> path to the created ZIP file
   */
  public createImagesZip(
    imagePaths: string[],
    options?: Partial<ExportOptions>
  ): Observable<string> {
    // This would integrate with a native ZIP library or plugin
    return throwError(() => new Error('ZIP creation requires native implementation'));
  }

  /**
   * Export complete data package (CSV + images ZIP)
   * @param findings Array of findings to export
   * @param options Export options
   * @returns Observable<ExportResult> complete export result
   */
  public exportCompletePackage(
    findings: TreeFinding[],
    options?: Partial<ExportOptions>
  ): Observable<ExportResult> {
    // This would orchestrate CSV export and ZIP creation
    const format = options?.format || 'csv';
    
    if (format === 'csv') {
      return this.exportToCSV(findings, options);
    } else {
      return this.exportToJSON(findings, options);
    }
  }

  /**
   * Generate CSV content from findings
   * @param findings Array of findings
   * @returns CSV string
   */
  private generateCSV(findings: TreeFinding[]): string {
    const headers = [
      'ID',
      'Species 1',
      'Confidence 1',
      'Species 2',
      'Confidence 2',
      'Species 3',
      'Confidence 3',
      'Latitude',
      'Longitude',
      'Altitude',
      'Timestamp',
      'Transcription',
      'Image File'
    ];

    const rows = findings.map(finding => {
      const row = [
        finding.id,
        finding.identifications[0]?.species || '',
        finding.identifications[0]?.confidence?.toString() || '0',
        finding.identifications[1]?.species || '',
        finding.identifications[1]?.confidence?.toString() || '',
        finding.identifications[2]?.species || '',
        finding.identifications[2]?.confidence?.toString() || '',
        finding.location.latitude.toString(),
        finding.location.longitude.toString(),
        finding.location.altitude?.toString() || '',
        new Date(finding.recordedAt).toISOString(),
        this.escapeCSV(finding.audioTranscription?.text || ''),
        finding.imageExif.imagePath
      ];
      return row.map(field => this.escapeCSV(field)).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Escape CSV field values
   * @param value Field value
   * @returns Escaped value
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Share export file using native share dialog
   * @param filePath Path to the file to share
   * @returns Observable<void>
   */
  public shareExport(filePath: string): Observable<void> {
    // This would integrate with Capacitor Share plugin
    return throwError(() => new Error('Share functionality requires native implementation'));
  }
}
