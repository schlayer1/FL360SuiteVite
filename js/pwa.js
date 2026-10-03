/**
 * PWA REGISTRATION & INSTALLATION HANDLER (Fachleiter 360° Suite Pro)
 */

let deferredInstallPrompt = null;

function initPWA() {
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('✅ ServiceWorker registered for Offline PWA Mode:', reg.scope);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration notice:', err);
        });
    });
  }

  // Handle Desktop/Mobile PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
    if (typeof showToast === 'function') {
      showToast('🎉 Fachleiter 360° Suite erfolgreich als App installiert!', '📲');
    }
  });

  // Check if already running standalone
  if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (typeof navigator !== 'undefined' && navigator.standalone === true)) {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'none';
  }
}

async function triggerPWAInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredInstallPrompt = null;
      const btn = document.getElementById('pwaInstallBtn');
      if (btn) btn.style.display = 'none';
    }
  } else {
    // Show instruction for iOS / Safari / Mac
    if (typeof openModal === 'function') {
      openModal({
        title: "App installieren (Mac, iPad, Windows)",
        bodyHTML: `
          <div style="font-size:0.9rem; color:#cbd5e1; line-height:1.6;">
            <p><strong>So installieren Sie die Suite auf Ihrem Gerät:</strong></p>
            <ul style="padding-left:20px; margin-bottom:16px;">
              <li><strong>Google Chrome / Edge (Mac &amp; Windows):</strong> Klicken Sie rechts oben in der Adressleiste auf das <strong>Installieren-Symbol (⊕)</strong>.</li>
              <li><strong>Safari auf Mac:</strong> Klicken Sie im Menü auf <em>Ablage</em> &rarr; <em>Zum Dock hinzufügen...</em></li>
              <li><strong>iPad &amp; iPhone (Safari):</strong> Tippen Sie auf das <strong>Teilen-Symbol (⎋)</strong> &rarr; <em>Zum Home-Bildschirm</em>.</li>
            </ul>
            <div style="background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.25); border-radius:8px; padding:12px; font-size:0.84rem; color:#60a5fa; display:flex; align-items:flex-start; gap:8px;">
              <i data-lucide="info" class="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500"></i>
              <div><strong>Vorteil:</strong> Die Suite läuft danach in einem eigenen, ablenkungsfreien Fenster und ist auch in Schulen ohne Internetverbindung zu 100% offline einsatzbereit.</div>
            </div>
          </div>
        `
      });
    }
  }
}

initPWA();
