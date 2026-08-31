/**
 * COHORT & SEMINAR OVERVIEW MATRIX (Fachleiter 360° Suite Pro)
 */

if (typeof dashboardViewMode === 'undefined') {
  var dashboardViewMode = "profile";
}

function setDashboardViewMode(mode) {
  dashboardViewMode = mode;
  renderDashboard();
}

function renderCohortOverview() {
  const container = document.getElementById("dashboardCohortView") || document.getElementById("tab-dashboard");
  if (!container) return;

  const laas = appState.laas || {};
  const entries = Object.entries(laas);

  // Calculate Cohort Metrics
  let totalCandidates = entries.length;
  let countLAA = 0;
  let countNQ = 0;
  let countWB = 0;
  let allGrades = [];
  let upcomingDeadlines = [];
  let totalGoals = 0;
  let doneGoals = 0;

  const now = new Date();
  const next30Days = new Date();
  next30Days.setDate(now.getDate() + 30);

  entries.forEach(([id, laa]) => {
    if (laa.type === 'NQ') countNQ++;
    else if (laa.type === 'WB') countWB++;
    else countLAA++;

    (laa.visits || []).forEach(v => {
      if (v.grade) {
        const parsed = parseFloat(String(v.grade).replace(',', '.'));
        if (!isNaN(parsed)) allGrades.push(parsed);
      }
    });

    (laa.goals || []).forEach(g => {
      totalGoals++;
      if (g.status === 'done') doneGoals++;
    });

    (laa.appointments || []).forEach(a => {
      const aDate = new Date(a.date);
      if (aDate >= new Date(new Date().setHours(0,0,0,0)) && aDate <= next30Days) {
        upcomingDeadlines.push({
          candidateName: laa.name,
          candidateId: id,
          title: a.title,
          date: a.date,
          time: a.time,
          type: a.type
        });
      }
    });
  });

  upcomingDeadlines.sort((a, b) => new Date(a.date) - new Date(b.date));

  const avgGrade = allGrades.length > 0
    ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(2).replace('.', ',')
    : '–';

  const goalPercentage = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;

  let tableRows = "";
  if (entries.length === 0) {
    tableRows = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#94a3b8;">Noch keine Kandidaten angelegt.</td></tr>`;
  } else {
    entries.forEach(([id, laa]) => {
      const visitsCount = (laa.visits || []).length;
      let lastGrade = "–";
      if (visitsCount > 0) {
        lastGrade = laa.visits[visitsCount - 1].grade || "–";
      }

      // Next appointment
      const upcoming = (laa.appointments || [])
        .filter(a => new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      let nextAppHtml = '<span style="color:#94a3b8;">Kein Termin</span>';
      if (upcoming) {
        const d = new Date(upcoming.date);
        const daysDiff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        let badgeColor = "#22c55e";
        if (daysDiff <= 3) badgeColor = "#ef4444";
        else if (daysDiff <= 14) badgeColor = "#f59e0b";

        nextAppHtml = `
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${badgeColor}; flex-shrink:0;"></span>
            <div style="font-size:0.78rem;">
              <strong>${d.toLocaleDateString('de-DE')}</strong>: ${upcoming.title}
            </div>
          </div>
        `;
      }

      const goalsDone = (laa.goals || []).filter(g => g.status === 'done').length;
      const goalsTotal = (laa.goals || []).length;
      const seminarsCount = (laa.seminars || []).length;

      tableRows += `
        <tr>
          <td>
            <div style="font-weight:700; color:#1e293b;">${laa.name}</div>
            <div style="font-size:0.75rem; color:#64748b;">
              <span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.7rem; padding:2px 6px;">${laa.type || 'LAA'}</span>
              ${laa.schoolType || 'Regelschule'}
            </div>
          </td>
          <td>
            <div style="font-weight:600; font-size:0.84rem;">${laa.subject1 || '-'}${laa.subject2 ? ' / ' + laa.subject2 : ''}</div>
            <div style="font-size:0.75rem; color:#64748b;">${laa.school || '-'}</div>
          </td>
          <td>
            <div style="font-size:0.82rem; font-weight:600; color:#334155;">${laa.currentPhase || 'Hauptphase'}</div>
            <div style="font-size:0.74rem; color:#94a3b8;">${laa.cohort || '-'}</div>
          </td>
          <td style="text-align:center;">
            <span style="font-weight:700; font-size:0.95rem; color:#1e3a8a;">${visitsCount}</span>
            <div style="font-size:0.74rem; color:#64748b;">Zuletzt: <strong>${lastGrade}</strong></div>
          </td>
          <td>
            <div style="font-size:0.8rem; font-weight:600;">${goalsDone} / ${goalsTotal} erreicht</div>
            <div style="width:100%; height:4px; background:#e2e8f0; border-radius:2px; margin-top:3px; overflow:hidden;">
              <div style="width:${goalsTotal > 0 ? (goalsDone/goalsTotal)*100 : 0}%; height:100%; background:#10b981;"></div>
            </div>
          </td>
          <td style="text-align:center;">
            <span style="font-weight:600; font-size:0.84rem; color:#475569;">${seminarsCount} Module</span>
          </td>
          <td>
            ${nextAppHtml}
          </td>
          <td>
            <div style="display:flex; gap:4px; justify-content:flex-end;">
              <button class="btn btn-outline" style="font-size:0.72rem; padding:3px 7px;" onclick="selectLAAAndGo('${id}', 'tab-dashboard')" title="Profil öffnen">
                👤 Profil
              </button>
              <button class="btn btn-outline" style="font-size:0.72rem; padding:3px 7px;" onclick="selectLAAAndGo('${id}', 'tab-live')" title="Live-Hospitation starten">
                ⏱️ Hospitieren
              </button>
              <button class="btn btn-outline" style="font-size:0.72rem; padding:3px 7px;" onclick="selectLAAAndGo('${id}', 'tab-niederschrift')" title="Prüfungsniederschrift öffnen">
                📝 Niederschrift
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  container.innerHTML = `
    <!-- Cohort Summary Metrics -->
    <div class="metrics-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-bottom:22px;">
      <div class="stat-card">
        <div class="stat-icon" style="background:#eff6ff; color:#2563eb;">👥</div>
        <div>
          <div class="stat-value">${totalCandidates}</div>
          <div class="stat-label">Betreute Lehrkräfte (${countLAA} LAA • ${countNQ} NQ • ${countWB} WB)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#f0fdf4; color:#16a34a;">📈</div>
        <div>
          <div class="stat-value">Ø ${avgGrade}</div>
          <div class="stat-label">Seminar-Notendurchschnitt (UBs)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef3c7; color:#d97706;">🎯</div>
        <div>
          <div class="stat-value">${goalPercentage}%</div>
          <div class="stat-label">Ziele erreicht (${doneGoals}/${totalGoals})</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fdf2f8; color:#db2777;">📅</div>
        <div>
          <div class="stat-value">${upcomingDeadlines.length}</div>
          <div class="stat-label">Fristen &amp; Termine in 30 Tagen</div>
        </div>
      </div>
    </div>

    <!-- Full Cohort Matrix Table -->
    <div class="card" style="padding:0; overflow:hidden; margin-bottom:24px;">
      <div style="padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.05rem; color:#1e293b;">📋 Gesamtübersicht der Ausbildungsgruppe (${appState.seminarLocation || 'Studienseminar'})</h3>
        <span style="font-size:0.8rem; color:#64748b;">Stand: ${new Date().toLocaleDateString('de-DE')}</span>
      </div>
      <div class="table-responsive">
        <table class="data-table" style="margin:0;">
          <thead>
            <tr>
              <th>Kandidat / Typ</th>
              <th>Fächer &amp; Schule</th>
              <th>Ausbildungsphase</th>
              <th style="text-align:center;">UBs / Note</th>
              <th>Ziele</th>
              <th style="text-align:center;">Module</th>
              <th>Nächster Termin</th>
              <th style="text-align:right;">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function selectLAAAndGo(laaId, targetTab) {
  if (appState && appState.laas && appState.laas[laaId]) {
    appState.selectedLAA = laaId;
    saveState();
    populateLAASelector();
    setDashboardViewMode("profile");
    switchTab(targetTab);
  }
}

function exportCohortCSV() {
  const entries = Object.entries(appState.laas || {});
  if (entries.length === 0) {
    showToast("Keine Kandidatendaten zum Exportieren vorhanden!", "⚠️");
    return;
  }

  let csv = "Name;Typ;Schulart;Schule;Fach 1;Fach 2;Ausbildungsphase;Kohorte;Anzahl UBs;Letzte UB-Note;Ziele erreicht;Ziele gesamt\n";

  entries.forEach(([id, laa]) => {
    const visits = (laa.visits || []).length;
    const lastGrade = visits > 0 ? (laa.visits[visits - 1].grade || "") : "";
    const goalsDone = (laa.goals || []).filter(g => g.status === 'done').length;
    const goalsTotal = (laa.goals || []).length;

    const row = [
      `"${laa.name || ''}"`,
      `"${laa.type || 'LAA'}"`,
      `"${laa.schoolType || ''}"`,
      `"${laa.school || ''}"`,
      `"${laa.subject1 || ''}"`,
      `"${laa.subject2 || ''}"`,
      `"${laa.currentPhase || ''}"`,
      `"${laa.cohort || ''}"`,
      visits,
      `"${lastGrade}"`,
      goalsDone,
      goalsTotal
    ];
    csv += row.join(";") + "\n";
  });

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Seminar_Uebersicht_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast("CSV-Export erfolgreich generiert!", "📑");
}
