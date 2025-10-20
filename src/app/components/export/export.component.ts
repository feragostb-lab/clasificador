import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { TreeFinding } from '../../models';
import { TreeFindingService, ExportService, ExportOptions, ExportResult } from '../../services';

/**
 * Export component for exporting findings to CSV/JSON and creating ZIP archives
 * Implements OnPush change detection strategy as required
 */
@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportComponent implements OnInit {
  // State signals
  findings = signal<TreeFinding[]>([]);
  isExporting = signal(false);
  exportResult = signal<ExportResult | null>(null);
  errorMessage = signal<string | null>(null);

  // Export options
  exportFormat = signal<'csv' | 'json'>('csv');
  includeImages = signal(true);
  includeAudio = signal(false);
  fileNamePrefix = signal('tree-findings');

  constructor(
    private treeFindingService: TreeFindingService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadFindings();
  }

  /**
   * Load all findings
   */
  loadFindings(): void {
    this.treeFindingService.getAllFindings().pipe(
      catchError(error => {
        this.handleError('Failed to load findings', error);
        return of([]);
      })
    ).subscribe(findings => {
      this.findings.set(findings);
    });
  }

  /**
   * Start the export process
   */
  startExport(): void {
    if (this.findings().length === 0) {
      this.errorMessage.set('No findings to export');
      return;
    }

    this.isExporting.set(true);
    this.errorMessage.set(null);
    this.exportResult.set(null);

    const options: Partial<ExportOptions> = {
      format: this.exportFormat(),
      includeImages: this.includeImages(),
      includeAudio: this.includeAudio(),
      fileNamePrefix: this.fileNamePrefix()
    };

    const exportObservable = this.exportFormat() === 'csv'
      ? this.exportService.exportToCSV(this.findings(), options)
      : this.exportService.exportToJSON(this.findings(), options);

    exportObservable.pipe(
      catchError(error => {
        this.handleError('Export failed', error);
        this.isExporting.set(false);
        return of(null);
      })
    ).subscribe(result => {
      this.isExporting.set(false);
      if (result) {
        this.exportResult.set(result);
      }
    });
  }

  /**
   * Create images ZIP archive
   */
  createImagesZip(): void {
    if (this.findings().length === 0) {
      this.errorMessage.set('No findings with images to export');
      return;
    }

    this.isExporting.set(true);
    this.errorMessage.set(null);

    const imagePaths = this.findings()
      .map(f => f.imageExif.imagePath)
      .filter(path => !!path);

    this.exportService.createImagesZip(imagePaths, {
      fileNamePrefix: this.fileNamePrefix()
    }).pipe(
      catchError(error => {
        this.handleError('Failed to create images ZIP', error);
        this.isExporting.set(false);
        return of(null);
      })
    ).subscribe(zipPath => {
      this.isExporting.set(false);
      if (zipPath) {
        console.log('Images ZIP created:', zipPath);
      }
    });
  }

  /**
   * Export complete package (CSV + images ZIP)
   */
  exportCompletePackage(): void {
    if (this.findings().length === 0) {
      this.errorMessage.set('No findings to export');
      return;
    }

    this.isExporting.set(true);
    this.errorMessage.set(null);
    this.exportResult.set(null);

    const options: Partial<ExportOptions> = {
      format: this.exportFormat(),
      includeImages: this.includeImages(),
      includeAudio: this.includeAudio(),
      fileNamePrefix: this.fileNamePrefix()
    };

    this.exportService.exportCompletePackage(this.findings(), options).pipe(
      catchError(error => {
        this.handleError('Complete export failed', error);
        this.isExporting.set(false);
        return of(null);
      })
    ).subscribe(result => {
      this.isExporting.set(false);
      if (result) {
        this.exportResult.set(result);
      }
    });
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    this.errorMessage.set(message);
    console.error(message, error);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage.set(null);
  }

  /**
   * Clear export result
   */
  clearResult(): void {
    this.exportResult.set(null);
  }

  /**
   * Get findings count
   */
  getFindingsCount(): number {
    return this.findings().length;
  }

  /**
   * Get completed findings count
   */
  getCompletedCount(): number {
    return this.findings().filter(f => f.status === 'completed').length;
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
