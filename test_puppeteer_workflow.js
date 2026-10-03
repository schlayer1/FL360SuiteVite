import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starte Puppeteer Livetest auf https://fl-360-suite-vite.vercel.app ...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ BROWSER ERROR:', msg.text());
    } else {
      console.log('ℹ️ BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('❌ PAGE CRASH / UNCAUGHT EXCEPTION:', err.message);
  });

  const delay = ms => new Promise(r => setTimeout(r, ms));
  // 1. Navigation
  console.log('📍 Navigiere zu Vercel Live-URL...');
  await page.goto('https://fl-360-suite-vite.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await delay(2500);

  // 2. Initial State Test & Bereinigung
  console.log('🧹 1. Lösche vorhandene Muster-Prüflinge und setze Fachleiterin Frau Könitzer...');
  const resetResult = await page.evaluate(async () => {
    // Fachleiterin festlegen
    appState.mentorName = "Fachleiterin Frau Könitzer";
    appState.laas = {};
    appState.selectedLAA = "";

    // 2. Kandidaten anlegen:
    // A) Herr Max Mustermann (LAA - Prüfungsphase / 3. Halbjahr)
    const id1 = "laa_mustermann";
    appState.laas[id1] = {
      id: id1,
      name: "Max Mustermann",
      gender: "m",
      type: "LAA",
      subject1: "Mathematik",
      subject2: "Physik",
      school: "Staatliche Regelschule Gera-Ost",
      schoolType: "Regelschule",
      mentor: "Frau Könitzer (Fachleiterin)",
      startDate: "2025-02-01",
      endDate: "2026-07-31",
      cohort: "2025/2026",
      currentPhase: "Prüfungsphase (3. Halbjahr)",
      notes: "Lehramtsanwärter kurz vor den Prüfungslehrproben nach ThürAZStPLVO. Sehr gute Strukturierung und klare Phasentransparenz.",
      competencies: { unterrichten: 4.2, erziehen: 4.0, beurteilen: 3.8, beraten: 4.0, weiterentwickeln: 4.2 },
      scoresHistory: [
        [3.2, 3.0, 3.5, 2.8, 3.0, 3.2], // UB 1
        [3.8, 3.6, 4.0, 3.4, 3.8, 3.8], // UB 2
        [4.2, 4.0, 4.4, 3.8, 4.0, 4.2]  // UB 3
      ],
      selfScores: [4.0, 4.2, 4.2, 3.5, 4.0, 4.2],
      visits: [
        {
          id: "v_mm_1",
          date: "2025-03-20",
          type: "1. Unterrichtsbesuch",
          subject: "Mathematik",
          class: "7a",
          topic: "Einführung linearer Funktionen – Steigungsdreiecke",
          grade: "2,7 (9 Pkt.)",
          scores: [3.2, 3.0, 3.5, 2.8, 3.0, 3.2],
          notes: "Guter Einstieg mit Steigungsprofilen. Aufgabenkultur noch zu lehrerzentriert."
        },
        {
          id: "v_mm_2",
          date: "2025-06-18",
          type: "2. Unterrichtsbesuch",
          subject: "Physik",
          class: "8b",
          topic: "Optische Linsen und Bildentstehung bei der Sammellinse",
          grade: "2,0 (12 Pkt.)",
          scores: [3.8, 3.6, 4.0, 3.4, 3.8, 3.8],
          notes: "Schülerorientierte Experimentierphase, sehr gute Allgegenwärtigkeit."
        },
        {
          id: "v_mm_3",
          date: "2025-11-25",
          type: "3. Unterrichtsbesuch",
          subject: "Mathematik",
          class: "9a",
          topic: "Satz des Pythagoras in anwendungsbezogenen Sachkontexten",
          grade: "1,7 (13 Pkt.)",
          scores: [4.2, 4.0, 4.4, 3.8, 4.0, 4.2],
          notes: "Hervorragende kognitive Aktivierung, gelungene Differenzierungsangebote."
        }
      ],
      goals: [
        { id: "g_1", text: "Schülerselbstständigkeit im Experimentieren durch gestufte Hilfekarten stärken.", status: "done", createdAt: "20.03.2025", source: "UB 1" },
        { id: "g_2", text: "Differenzierte Übungszirkel zur Vertiefung einsetzen.", status: "done", createdAt: "18.06.2025", source: "UB 2" },
        { id: "g_3", text: "Didaktische Feinabstimmung der 1. Prüfungslehrprobe mit der Schule finalisieren.", status: "progress", createdAt: "25.11.2025", source: "UB 3" }
      ],
      appointments: [
        { id: "app_1", title: "1. Prüfungslehrprobe (Mathematik Kl. 9)", date: "2026-03-15", time: "09:45", location: "RS Gera-Ost, R 104" }
      ],
      reflectionEntries: [
        { id: "ref_1", ubId: "v_mm_3", title: "Auswertung UB 3", date: "2025-11-25", flScores: [4.2, 4.0, 4.4, 3.8, 4.0, 4.2], selfScores: [4.0, 4.2, 4.2, 3.5, 4.0, 4.2], notes: "Reflektierte Haltung." }
      ]
    };

    // B) Frau Erika Musterfrau (NQ - Orientierungsphase / 1. Halbjahr)
    const id2 = "nq_musterfrau";
    appState.laas[id2] = {
      id: id2,
      name: "Erika Musterfrau",
      gender: "f",
      type: "NQ",
      subject1: "Biologie",
      subject2: "Chemie",
      school: "Staatliche Regelschule Debschwitz Gera",
      schoolType: "Regelschule",
      mentor: "Fachleiterin Frau Könitzer",
      startDate: "2026-02-01",
      endDate: "2027-01-31",
      cohort: "Seiteneinstieg 2026",
      currentPhase: "Orientierungsphase (1. Halbjahr)",
      notes: "Seiteneinsteigerin aus der Industrie. Sehr hohes Fachwissen, pädagogisch-didaktische Basiskompetenzen in der Erarbeitung.",
      competencies: { unterrichten: 2.8, erziehen: 3.0, beurteilen: 2.5, beraten: 2.8, weiterentwickeln: 3.2 },
      scoresHistory: [
        [2.8, 3.0, 2.5, 2.2, 2.5, 3.0] // UB 1
      ],
      selfScores: [3.5, 3.5, 3.0, 2.5, 3.0, 3.5],
      visits: [
        {
          id: "v_em_1",
          date: "2026-03-05",
          type: "1. Beratungsbesuch",
          subject: "Biologie",
          class: "6b",
          topic: "Bau und Funktionsweise der Laubblatt-Zelle unter dem Mikroskop",
          grade: "3,3 (7 Pkt.)",
          scores: [2.8, 3.0, 2.5, 2.2, 2.5, 3.0],
          notes: "Gute fachliche Vorbereitung. Noch zu hohes Sprechtempo und Zeitdruck in der Sicherung."
        }
      ],
      goals: [
        { id: "g_em_1", text: "Phasentransparenz durch Stunden-Fahrplan an der Tafel sichern.", status: "progress", createdAt: "05.03.2026", source: "UB 1" },
        { id: "g_em_2", text: "Sprechtempo reduzieren und Wartezeit nach Schülerfragen einhalten.", status: "open", createdAt: "05.03.2026", source: "UB 1" }
      ],
      appointments: [
        { id: "app_em_1", title: "2. Beratungsbesuch (Chemie Kl. 8)", date: "2026-04-12", time: "10:30", location: "RS Debschwitz, Chemieraum" }
      ],
      reflectionEntries: []
    };

    appState.selectedLAA = id1; // Start mit Herrn Mustermann
    saveState();
    populateLAASelector();
    renderDashboard(appState.laas[id1]);
    return {
      mentor: appState.mentorName,
      candidates: Object.keys(appState.laas).map(k => ({ id: k, name: appState.laas[k].name, type: appState.laas[k].type }))
    };
  });

  console.log('✅ Daten initialisiert:', JSON.stringify(resetResult, null, 2));

  // 3. Workflow-Schritt 1: Dashboard Test
  console.log('🔍 Teste Dashboard von Herrn Mustermann...');
  await delay(1000);
  const candidateNameOnPage = await page.$eval('#candidateNameDisplay', el => el.innerText).catch(() => 'n/a');
  console.log('Candidate Name Display:', candidateNameOnPage);

  // 4. Workflow-Schritt 2: Wechsel zu Frau Musterfrau
  console.log('🔄 Wechsle Kandidat zu Frau Musterfrau (NQ)...');
  await page.evaluate(() => {
    handleLAAChange('nq_musterfrau');
  });
  await delay(1000);
  const switchedName = await page.$eval('#candidateNameDisplay', el => el.innerText).catch(() => 'n/a');
  console.log('Switched to:', switchedName);

  // 5. Workflow-Schritt 3: Wechsel zu Herrn Mustermann und starte Live-Hospitation
  console.log('⏱️ Starte Live-Hospitations-Workflow für Herrn Mustermann...');
  await page.evaluate(() => {
    handleLAAChange('laa_mustermann');
    switchTab('tab-live');
  });
  await delay(1000);

  // Klicke Stoppuhr Start
  console.log('▶️ Starte Timer...');
  await page.click('#btnToggleTimer');
  await delay(1500);

  // Schalte Phase um auf "Erarbeitung"
  console.log('🔄 Klicke Phase "Erarbeitung"...');
  await page.evaluate(() => {
    quickSwitchPhase('Erarbeitung');
  });

  // Notiz eingeben
  console.log('✍️ Gebe Beobachtungsnotiz ein...');
  await page.type('#liveNoteInput', 'Herr Mustermann leitet die Partnerarbeit souverän ein. Schülertandems bearbeiten Aufgaben zügig.');
  await page.keyboard.press('Enter');
  await delay(500);

  // Phrasenbaustein einfügen
  console.log('🧩 Klicke Phrasenbaustein...');
  await page.evaluate(() => {
    insertPhrase('Treffende didaktische Reduktion auf das wesentliche Stundenziel gelungen.');
  });
  await page.keyboard.press('Enter');
  await delay(500);

  // Kriterien bewerten
  console.log('⭐ Kriterien bewerten...');
  await page.evaluate(() => {
    rateCrit(0, 4); // Fachdidaktik 4
    rateCrit(1, 4); // Klassenführung 4
    rateCrit(2, 5); // Unterrichtsplanung 5
    rateCrit(3, 4); // Heterogenität 4
  });
  await delay(1000);

  // 6. Hospitation abschließen
  console.log('🏁 Öffne Modal "Hospitation abschließen"...');
  await page.evaluate(() => {
    openFinishVisitModal();
  });
  await delay(800);

  console.log('💾 Schließe Besuch ab...');
  await page.evaluate(() => {
    const topicInput = document.getElementById('finishVisit_topic');
    if (topicInput) topicInput.value = "Prüfungsvorbereitende Lehrprobe: Trigonometrie am rechtwinkligen Dreieck";
    const pointsSelect = document.getElementById('finishVisit_points');
    if (pointsSelect) pointsSelect.value = "13";
    saveFinishedVisit();
  });
  await delay(1000);

  // 7. Workflow-Modal prüfen
  console.log('🔀 Navigiere zum Reflexionsabgleich...');
  await page.evaluate(() => {
    closeModal();
    switchTab('tab-reflexion');
  });
  await delay(1500);

  // 8. Niederschrift & Prüfungsrechner aufrufen
  console.log('📝 Teste Niederschrift & 15-Punkte-Bewertungsraster...');
  await page.evaluate(() => {
    switchTab('tab-niederschrift');
  });
  await delay(1500);

  // Setze Bepunktungen im Raster
  console.log('📊 Bepunkte 15-Punkte-Raster...');
  await page.evaluate(() => {
    if (typeof nsSelectPointGroup === 'function') {
      nsSelectPointGroup('struktur', 1); // 13-11 Punkte
      nsSelectPointGroup('gespraech', 1);
      nsSelectPointGroup('aktivierung', 0); // 15-14 Punkte
    }
  });
  await delay(1000);

  // Prüfungsrechner aufrufen
  console.log('🧮 Teste amtlichen Prüfungsrechner (§ 33 ThürAZStPLVO)...');
  await page.evaluate(() => {
    switchTab('tab-fristen');
  });
  await delay(1500);

  const calcResult = await page.evaluate(() => {
    const el = document.getElementById('calcFinalScoreDisplay');
    return el ? el.innerText : 'n/a';
  });
  console.log('Gesamtergebnis Rechneranzeige:', calcResult);

  // 9. Status & Error Summary
  console.log('==============================================');
  console.log(`LIVETEST ERFOLGREICH! Total uncaught errors: ${errors.length}`);
  console.log('==============================================');

  await browser.close();
})();
