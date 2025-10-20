import { Injectable } from '@angular/core';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { TreeFinding, TreeFindingExport, GpsCoordinates } from '../models';

/**
 * Service for managing tree findings: storage, retrieval, and management
 */
@Injectable({
  providedIn: 'root'
})
export class TreeFindingService {
  private findings: Map<string, TreeFinding> = new Map();

  constructor() { }

  /**
   * Store a tree finding
   * @param finding Tree finding to store
   * @returns Observable<string> ID of the stored finding
   */
  public storeFinding(finding: TreeFinding): Observable<string> {
    try {
      this.findings.set(finding.id, finding);
      return of(finding.id);
    } catch (error) {
      return throwError(() => new Error(`Failed to store finding: ${error}`));
    }
  }

  /**
   * Retrieve a tree finding by ID
   * @param id Finding ID
   * @returns Observable<TreeFinding> the requested finding
   */
  public getFinding(id: string): Observable<TreeFinding> {
    const finding = this.findings.get(id);
    if (finding) {
      return of(finding);
    }
    return throwError(() => new Error(`Finding with ID ${id} not found`));
  }

  /**
   * Get all tree findings
   * @returns Observable<TreeFinding[]> array of all findings
   */
  public getAllFindings(): Observable<TreeFinding[]> {
    return of(Array.from(this.findings.values()));
  }

  /**
   * Filter findings by status
   * @param status Status to filter by
   * @returns Observable<TreeFinding[]> filtered findings
   */
  public getFindingsByStatus(
    status: TreeFinding['status']
  ): Observable<TreeFinding[]> {
    const filtered = Array.from(this.findings.values())
      .filter(f => f.status === status);
    return of(filtered);
  }

  /**
   * Update a tree finding
   * @param id Finding ID
   * @param updates Partial finding updates
   * @returns Observable<TreeFinding> updated finding
   */
  public updateFinding(
    id: string,
    updates: Partial<TreeFinding>
  ): Observable<TreeFinding> {
    const finding = this.findings.get(id);
    if (!finding) {
      return throwError(() => new Error(`Finding with ID ${id} not found`));
    }

    const updated = { ...finding, ...updates };
    this.findings.set(id, updated);
    return of(updated);
  }

  /**
   * Delete a tree finding
   * @param id Finding ID
   * @returns Observable<void>
   */
  public deleteFinding(id: string): Observable<void> {
    if (!this.findings.has(id)) {
      return throwError(() => new Error(`Finding with ID ${id} not found`));
    }
    this.findings.delete(id);
    return of(undefined);
  }

  /**
   * Clear all findings
   * @returns Observable<void>
   */
  public clearAllFindings(): Observable<void> {
    this.findings.clear();
    return of(undefined);
  }

  /**
   * Get findings count
   * @returns number of stored findings
   */
  public getCount(): number {
    return this.findings.size;
  }

  /**
   * Search findings by species
   * @param species Species name to search for
   * @returns Observable<TreeFinding[]> matching findings
   */
  public searchBySpecies(species: string): Observable<TreeFinding[]> {
    const results = Array.from(this.findings.values())
      .filter(finding => 
        finding.identifications.some(id => 
          id.species.toLowerCase().includes(species.toLowerCase())
        )
      );
    return of(results);
  }

  /**
   * Get findings within a geographic area
   * @param center Center coordinates
   * @param radiusKm Radius in kilometers
   * @returns Observable<TreeFinding[]> findings within the area
   */
  public getFindingsInArea(
    center: GpsCoordinates,
    radiusKm: number
  ): Observable<TreeFinding[]> {
    const results = Array.from(this.findings.values())
      .filter(finding => {
        const distance = this.calculateDistance(
          center.latitude,
          center.longitude,
          finding.location.latitude,
          finding.location.longitude
        );
        return distance <= radiusKm;
      });
    return of(results);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 Latitude 1
   * @param lon1 Longitude 1
   * @param lat2 Latitude 2
   * @param lon2 Longitude 2
   * @returns Distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert findings to export format
   * @param findings Array of findings to convert
   * @returns TreeFindingExport[] array in export format
   */
  public convertToExportFormat(findings: TreeFinding[]): TreeFindingExport[] {
    return findings.map(finding => {
      const exportData: TreeFindingExport = {
        id: finding.id,
        species1: finding.identifications[0]?.species || '',
        confidence1: finding.identifications[0]?.confidence || 0,
        latitude: finding.location.latitude,
        longitude: finding.location.longitude,
        altitude: finding.location.altitude,
        timestamp: finding.recordedAt,
        transcription: finding.audioTranscription?.text,
        imageFileName: finding.imageExif.imagePath
      };

      if (finding.identifications[1]) {
        exportData.species2 = finding.identifications[1].species;
        exportData.confidence2 = finding.identifications[1].confidence;
      }

      if (finding.identifications[2]) {
        exportData.species3 = finding.identifications[2].species;
        exportData.confidence3 = finding.identifications[2].confidence;
      }

      return exportData;
    });
  }
}
