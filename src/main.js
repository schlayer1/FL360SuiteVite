/**
 * VITE APPLICATION ENTRYPOINT (Fachleiter 360° Suite Pro)
 * Lädt Icons, Chart.js, PDF-Engine und verdrahtet die Suite modular
 */

// Stylesheets
import './styles/main.css';

// Lokale Bibliotheken aus node_modules
import * as LucideIcons from 'lucide';
import { Chart, registerables } from 'chart.js';
import * as PDFLib from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Resilient Storage Engine
import { resilientStorage } from './storage/resilience';

// Chart.js Registrierung
Chart.register(...registerables);

// Robuste createIcons-Bereitstellung mit allen Icons für bestehenden Code
const robustCreateIcons = (options = {}) => {
  return LucideIcons.createIcons({ icons: LucideIcons.icons, ...options });
};

const lucideFacade = {
  ...LucideIcons,
  createIcons: robustCreateIcons
};

// Bereitstellung auf dem globalen Window-Objekt für Rückwärtskompatibilität der Fachleiter-Module
window.lucide = lucideFacade;
window.Chart = Chart;
window.PDFLib = PDFLib;
window.pdfjsLib = pdfjsLib;
window.resilientStorage = resilientStorage;

// PDF.js Worker Konfiguration (lokales autarkes Offline-Asset via Vite)
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// 1-Klick Backup Handler
window.triggerResilientBackup = function() {
  if (typeof window.exportDataJSON === 'function') {
    window.exportDataJSON();
    resilientStorage.recordBackupTimestamp();
    if (typeof window.showToast === 'function') {
      window.showToast("Sicherung erfolgreich heruntergeladen!", "check-circle");
    }
  }
};

// Automatischer Aufruf nach DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Fachleiter 360° Vite] Initialisiere modulare Suite & Schutzsystem...');
  
  // 1. Initialisiere Persistent Storage & Backup Sentinel
  await resilientStorage.initPersistence();

  // 2. Primäre Asynchrone IndexedDB-Rehydrierung (Autoritativer Master)
  if (window.appState && typeof resilientStorage.loadState === 'function') {
    try {
      const persistedState = await resilientStorage.loadState(window.appState);
      if (persistedState && persistedState !== window.appState) {
        // Deep-Merge von IndexedDB in window.appState
        Object.assign(window.appState, persistedState);
        console.log('[Fachleiter 360° Vite] AppState erfolgreich aus autoritativer IndexedDB synchronisiert.');
        
        // Aktualisiere Ansicht falls nötig
        if (typeof window.updateHeaderPhaseBadge === 'function' && typeof window.getCurrentLAA === 'function') {
          window.updateHeaderPhaseBadge(window.getCurrentLAA());
        }
      }
    } catch (e) {
      console.warn('[Fachleiter 360° Vite] IndexedDB-Rehydrierung Hinweis:', e);
    }
  }

  // 3. Erzeuge Lucide Icons (Scoped & Throttled)
  if (typeof window.refreshLucideIcons === 'function') {
    window.refreshLucideIcons();
  } else if (typeof window.lucide?.createIcons === 'function') {
    window.lucide.createIcons();
  }
});
