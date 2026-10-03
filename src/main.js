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

// Resilient Storage Engine
import { resilientStorage } from './storage/resilience';

// Chart.js Registrierung
Chart.register(...registerables);

// Bereitstellung auf dem globalen Window-Objekt für Rückwärtskompatibilität der Fachleiter-Module
window.lucide = LucideIcons;
window.Chart = Chart;
window.PDFLib = PDFLib;
window.pdfjsLib = pdfjsLib;
window.resilientStorage = resilientStorage;

// PDF.js Worker Konfiguration (lokal)
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
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

  // 2. Erzeuge Lucide Icons
  if (typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
});
