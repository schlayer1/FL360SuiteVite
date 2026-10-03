/**
 * TRIPLE-TIER RESILIENT STORAGE ENGINE (Fachleiter 360° Suite Pro)
 * 
 * 1. Persistent Storage API: Beantragt navigator.storage.persist() gegen automatische Bereinigung
 * 2. IndexedDB-Spiegelung: Hält den gesamten Zustand asynchron in IndexedDB via idb-keyval
 * 3. Proaktiver Backup Sentinel: Berechnet Zeitstempel, warnt vor Verlassen und bietet 1-Klick-Backup
 */

import { get, set, del } from 'idb-keyval';

const IDB_KEY = 'fl_suite_360_state_v8';
const BACKUP_TIMESTAMP_KEY = 'fl_suite_last_backup_time';

export class ResilientStorage {
  constructor() {
    this.isPersisted = false;
    this.quotaInfo = null;
    this.hasUnsavedChanges = false;
  }

  /**
   * 1. Persistent Storage API aktivieren
   */
  async initPersistence() {
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        this.isPersisted = await navigator.storage.persisted();
        if (!this.isPersisted) {
          this.isPersisted = await navigator.storage.persist();
        }
        console.log(`[ResilientStorage] Storage persistence: ${this.isPersisted ? 'GRANTED (Dauerhaft geschützt)' : 'PROMPT / DEFAULT'}`);
        
        if (navigator.storage.estimate) {
          this.quotaInfo = await navigator.storage.estimate();
        }
      }
    } catch (e) {
      console.warn('[ResilientStorage] Persistence check warning:', e);
    }

    this.renderStorageBadge();
    this.setupExitGuard();
    this.checkBackupAge();
  }

  /**
   * 2. Lädt den Zustand (bevorzugt aus IndexedDB mit automatischem Fallback auf localStorage)
   */
  async loadState(defaultData) {
    try {
      // Versuch 1: IndexedDB (primär)
      const idbData = await get(IDB_KEY);
      if (idbData && idbData.laas && typeof idbData.laas === 'object') {
        console.log('[ResilientStorage] Zustand erfolgreich aus IndexedDB geladen.');
        return idbData;
      }
    } catch (err) {
      console.warn('[ResilientStorage] IndexedDB read notice, prüfe localStorage Fallback:', err);
    }

    // Versuch 2: localStorage (Migrations- und Notfall-Fallback)
    try {
      if (typeof localStorage !== 'undefined') {
        const localRaw = localStorage.getItem('fl_cockpit_pro_state_v8');
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (parsed && parsed.laas && typeof parsed.laas === 'object') {
            console.log('[ResilientStorage] Zustand aus localStorage migriert und in IndexedDB gespiegelt.');
            await set(IDB_KEY, parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[ResilientStorage] LocalStorage fallback read error:', e);
    }

    // Default Daten
    return defaultData;
  }

  /**
   * 3. Speichert den Zustand atomar in IndexedDB und synchron im localStorage-Spiegel
   */
  async saveState(state) {
    this.hasUnsavedChanges = true;
    try {
      // Synchroner Spiegel (sofortige Verfügbarkeit)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('fl_cockpit_pro_state_v8', JSON.stringify(state));
      }
      
      // Asynchroner robuster IndexedDB-Commit
      await set(IDB_KEY, state);
    } catch (e) {
      console.error('[ResilientStorage] Fehler beim Speichern des Zustands:', e);
    }
  }

  /**
   * Visualisiert den Speicherschutz im Footer
   */
  renderStorageBadge() {
    const footer = document.querySelector('.privacy-footer > div:first-child');
    if (!footer) return;

    let badge = document.getElementById('flStorageResilienceBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'flStorageResilienceBadge';
      badge.className = 'storage-resilience-badge ml-2';
      footer.appendChild(badge);
    }

    if (this.isPersisted) {
      badge.className = 'storage-resilience-badge persisted ml-2';
      badge.innerHTML = '🛡️ Dauerhafter Gerätespeicher aktiv';
      badge.title = 'Der Browser schützt diesen Datenbestand dauerhaft vor automatischer Bereinigung.';
    } else {
      badge.className = 'storage-resilience-badge ml-2';
      badge.innerHTML = '💾 Lokaler Gerätespeicher aktiv';
      badge.title = 'Daten werden lokal auf diesem Gerät gespeichert.';
    }
  }

  /**
   * Registriert Schließschutz (beforeunload) bei aktiven Live-Sitzungen
   */
  setupExitGuard() {
    window.addEventListener('beforeunload', (e) => {
      // Wenn eine Live-Hospitation mit laufendem Timer oder Mitschrift aktiv ist
      if (window.liveTimerRunning || (window.liveLogs && window.liveLogs.length > 0)) {
        e.preventDefault();
        e.returnValue = 'Sie haben eine laufende Unterrichtsmitschrift. Möchten Sie die Seite wirklich verlassen?';
        return e.returnValue;
      }
    });
  }

  /**
   * Protokolliert erfolgreichen Backup-Export
   */
  recordBackupTimestamp() {
    const now = Date.now();
    localStorage.setItem(BACKUP_TIMESTAMP_KEY, now.toString());
    this.hasUnsavedChanges = false;
    this.removeSentinelBanner();
  }

  /**
   * Prüft Alter des letzten Backups und blendet unaufdringlichen Reminder ein
   */
  checkBackupAge() {
    try {
      const lastBackup = localStorage.getItem(BACKUP_TIMESTAMP_KEY);
      const container = document.getElementById('dashboardMetricsGrid') || document.querySelector('.main-content');
      if (!container) return;

      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      let msg = '';
      if (!lastBackup) {
        msg = 'Noch keine externe Datensicherung angelegt.';
      } else {
        const diffMs = now - parseInt(lastBackup, 10);
        if (diffMs > oneDayMs * 2) {
          const daysAgo = Math.floor(diffMs / oneDayMs);
          const dateStr = new Date(parseInt(lastBackup, 10)).toLocaleDateString('de-DE');
          msg = `Letzte Datensicherung vor ${daysAgo} Tagen (${dateStr}).`;
        }
      }

      if (msg) {
        this.renderSentinelBanner(msg);
      }
    } catch (e) {
      console.warn('[ResilientStorage] Backup age check notice:', e);
    }
  }

  renderSentinelBanner(reasonText) {
    if (document.getElementById('backupSentinelBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'backupSentinelBanner';
    banner.className = 'backup-sentinel-banner';
    banner.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-xl">💾</span>
        <div>
          <strong class="text-amber-300 font-semibold text-xs block">Empfohlene Datensicherung für Studienseminar Gera</strong>
          <span class="text-[0.8rem] opacity-90">${reasonText} Sichern Sie Ihre Beurteilungen mit einem Klick lokal ab.</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-primary text-xs py-1 px-3" onclick="window.triggerResilientBackup()">
          ⚡ 1-Klick-Sicherung (.json)
        </button>
        <button type="button" class="btn btn-ghost text-xs p-1" onclick="document.getElementById('backupSentinelBanner').remove()">
          ✕
        </button>
      </div>
    `;

    const mainContainer = document.querySelector('.main-content');
    if (mainContainer) {
      mainContainer.insertBefore(banner, mainContainer.firstChild);
    }
  }

  removeSentinelBanner() {
    const b = document.getElementById('backupSentinelBanner');
    if (b) b.remove();
  }
}

export const resilientStorage = new ResilientStorage();
