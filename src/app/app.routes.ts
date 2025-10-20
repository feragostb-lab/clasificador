import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/capture', pathMatch: 'full' },
  { 
    path: 'capture', 
    loadComponent: () => import('./components/capture/capture.component').then(m => m.CaptureComponent)
  },
  { 
    path: 'processing', 
    loadComponent: () => import('./components/processing/processing.component').then(m => m.ProcessingComponent)
  },
  { 
    path: 'findings', 
    loadComponent: () => import('./components/findings/findings-list.component').then(m => m.FindingsListComponent)
  },
  { 
    path: 'export', 
    loadComponent: () => import('./components/export/export.component').then(m => m.ExportComponent)
  }
];
