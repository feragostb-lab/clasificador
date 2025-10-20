import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { TreeFinding } from '../../models';
import { TreeFindingService } from '../../services';

/**
 * Findings list component to display all stored tree findings
 * Implements OnPush change detection strategy as required
 */
@Component({
  selector: 'app-findings-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './findings-list.component.html',
  styleUrls: ['./findings-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindingsListComponent implements OnInit {
  // State signals
  findings = signal<TreeFinding[]>([]);
  selectedFinding = signal<TreeFinding | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  filterStatus = signal<TreeFinding['status'] | 'all'>('all');

  constructor(private treeFindingService: TreeFindingService) {}

  ngOnInit(): void {
    this.loadFindings();
  }

  /**
   * Load all findings from the service
   */
  loadFindings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.treeFindingService.getAllFindings().pipe(
      catchError(error => {
        this.handleError('Failed to load findings', error);
        return of([]);
      })
    ).subscribe(findings => {
      this.findings.set(findings);
      this.isLoading.set(false);
    });
  }

  /**
   * Filter findings by status
   */
  filterByStatus(status: TreeFinding['status'] | 'all'): void {
    this.filterStatus.set(status);
    
    if (status === 'all') {
      this.loadFindings();
      return;
    }

    this.isLoading.set(true);
    this.treeFindingService.getFindingsByStatus(status).pipe(
      catchError(error => {
        this.handleError('Failed to filter findings', error);
        return of([]);
      })
    ).subscribe(findings => {
      this.findings.set(findings);
      this.isLoading.set(false);
    });
  }

  /**
   * Select a finding to view details
   */
  selectFinding(finding: TreeFinding): void {
    this.selectedFinding.set(finding);
  }

  /**
   * Clear selected finding
   */
  clearSelection(): void {
    this.selectedFinding.set(null);
  }

  /**
   * Delete a finding
   */
  deleteFinding(id: string): void {
    if (!confirm('Are you sure you want to delete this finding?')) {
      return;
    }

    this.treeFindingService.deleteFinding(id).pipe(
      catchError(error => {
        this.handleError('Failed to delete finding', error);
        return of(null);
      })
    ).subscribe(() => {
      this.loadFindings();
      if (this.selectedFinding()?.id === id) {
        this.clearSelection();
      }
    });
  }

  /**
   * Get filtered findings for display
   */
  getFilteredFindings(): TreeFinding[] {
    return this.findings();
  }

  /**
   * Handle errors
   */
  private handleError(message: string, error: any): void {
    this.errorMessage.set(message);
    this.isLoading.set(false);
    console.error(message, error);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage.set(null);
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Get total findings count
   */
  getTotalCount(): number {
    return this.treeFindingService.getCount();
  }
}
