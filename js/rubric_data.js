/**
 * Thüringer 15-Punkte-System Bewertungsraster & Amtliche Deskriptoren nach ThürAZStPLVO
 */
const EXAM_RUBRIC_DATA = {
          muendlich: {
            title: "Mündliche Prüfung",
            categories: [
              {
                id: "m_fach", title: "Anforderung: Fachlichkeit", shortName: "Fachlichkeit",
                indicators: [
                  { id: "m_fach_1", name: "Die theoriegeleitete Betrachtung der Handlungssituation", grades: ["wird komplex analysiert und tiefgründig, vergleichend erläutert; die fachliche Korrektheit wird vielschichtig, differenziert, beispielhaft nachgewiesen", "wird umfassend analysiert und überwiegend erläutert; die fachliche Korrektheit wird fundiert nachgewiesen", "wird angemessen analysiert und prinzipiell erläutert; die fachliche Korrektheit wird grundsätzlich nachgewiesen", "wird ansatzweise analysiert und oberflächlich erläutert; die fachliche Korrektheit wird hinreichend nachgewiesen", "wird kaum oder lückenhaft analysiert und nachgewiesen", "wird nicht analysiert und nicht erläutert; die fachliche Korrektheit wird nicht nachgewiesen"] },
                  { id: "m_fach_2", name: "Der Bezug zu schulgesetzlichen Regelungen, Richtlinien und Lehrplänen sowie entsprechender Fachliteratur", grades: ["wird korrekt hergestellt", "wird überwiegend korrekt hergestellt", "wird weitgehend korrekt hergestellt", "wird teilweise korrekt hergestellt", "wird kaum hergestellt", "wird nicht hergestellt"] },
                  { id: "m_fach_3", name: "Die Schwerpunktsetzung innerhalb der Handlungssituation", grades: ["gelingt professionell", "gelingt themengerecht", "gelingt zweckmäßig", "gelingt teilweise themengerecht und nachvollziehbar", "gelingt kaum oder lückenhaft", "gelingt nicht oder fehlt"] },
                  { id: "m_fach_4", name: "Der bildungswissenschaftliche und fachspezifische Gehalt", grades: ["wird professionell ausgeführt und konsequent, souverän aufeinander bezogen", "wird zielgerichtet ausgeführt und themengerecht, überzeugend aufeinander bezogen", "wird prinzipiell ausgeführt und zweckmäßig aufeinander bezogen", "wird partiell, punktuell oder oberflächlich ausgeführt und bedingt aufeinander bezogen", "wird unzureichend ausgeführt und widersprüchlich oder kaum aufeinander bezogen", "wird nicht ausgeführt und nicht aufeinander bezogen"] },
                  { id: "m_fach_5", name: "Konzeptionelle Entscheidungen auf der Basis von Theorien und Modellen", grades: ["werden allumfassend begründet", "werden umfassend begründet", "werden grundsätzlich begründet", "werden ansatzweise begründet", "werden widersprüchlich oder unzureichend begründet", "werden nicht begründet"] }
                ]
              },
              {
                id: "m_komm", title: "Anforderung: Kommunikation", shortName: "Kommunikation",
                indicators: [
                  { id: "m_komm_1", name: "Der Lehramtsanwärter agiert dabei", grades: ["kompetent und konsequent in der Auseinandersetzung", "zielgerichtet und schlüssig in der Auseinandersetzung", "zweckmäßig in der Auseinandersetzung", "in kaum erkennbarer Auseinandersetzung", "ohne Auseinandersetzung", "konzeptionslos"] },
                  { id: "m_komm_2", name: "Im Umgang mit Fragen und Impulsen", grades: ["reagiert der Prüfling souverän, flexibel und kompetent", "reagiert der Prüfling überzeugend und zielgerichtet", "reagiert der Prüfling angemessen", "reagiert der Prüfling oberflächlich oder punktuell", "reagiert der Prüfling unpassend und unsicher", "reagiert der Prüfling nicht"] },
                  { id: "m_komm_3", name: "Die Problemerfassung und -darstellung", grades: ["gelingt tiefgründig, allumfassend und souverän", "gelingt umfassend und überzeugend", "gelingt im Wesentlichen", "gelingt hinreichend, bedingt oder teilweise", "gelingt kaum", "gelingt nicht"] },
                  { id: "m_komm_4", name: "Plausibilität, Folgerichtigkeit und Stringenz in der Vortragsweise", grades: ["werden in besonderem Maße und optimal erreicht", "werden zielgerichtet erreicht", "werden weitgehend erreicht", "werden ansatzweise erreicht", "werden kaum erreicht", "werden nicht erreicht"] }
                ]
              },
              {
                id: "m_refl", title: "Anforderung: Reflexion", shortName: "Reflexion",
                indicators: [
                  { id: "m_refl_1", name: "Die theoriegeleitete Praxisreflexion", grades: ["gelingt allumfassend und souverän", "gelingt umfassend und fundiert", "gelingt im Wesentlichen", "gelingt im Ansatz", "gelingt kaum oder widersprüchlich", "gelingt nicht oder abwegig"] },
                  { id: "m_refl_2", name: "Mehrperspektivität", grades: ["wird professionell erreicht", "wird zielgerichtet und schlüssig erreicht", "wird weitgehend und tragfähig erreicht", "wird ansatzweise erreicht", "wird kaum erreicht", "wird nicht erreicht"] },
                  { id: "m_refl_3", name: "Die Vernetzung zu weiteren Handlungssituationen", grades: ["wird optimal hergestellt", "wird zielgerichtet hergestellt", "wird prinzipiell hergestellt", "wird oberflächlich hergestellt", "wird unzureichend hergestellt", "wird nicht hergestellt"] },
                  { id: "m_refl_4", name: "Das eigene Professionshandeln", grades: ["wird nachhaltig reflektiert", "wird überzeugend reflektiert", "wird grundsätzlich reflektiert", "wird partiell reflektiert", "wird unzureichend reflektiert", "wird nicht reflektiert"] }
                ]
              },
              {
                id: "m_inno", title: "Anforderung: Innovation", shortName: "Innovation",
                indicators: [
                  { id: "m_inno_1", name: "Potenzen und Ressourcen für den Schulentwicklungsprozess", grades: ["werden tiefgründig erörtert", "werden fundiert erörtert", "werden grundsätzlich erörtert", "werden bedingt oder oberflächlich erörtert", "werden unzureichend erörtert", "werden nicht erörtert"] },
                  { id: "m_inno_2", name: "Der eigene und kollektive Lern- und Entwicklungsbedarf sowie entsprechende Maßnahmen", grades: ["werden zutreffend und souverän abgeleitet und konzipiert", "werden schlüssig abgeleitet und konzipiert", "werden im Wesentlichen abgeleitet und konzipiert", "werden mit erheblichen Abstrichen, aber erkennbar abgeleitet und konzipiert", "werden widersprüchlich oder lückenhaft abgeleitet und konzipiert", "werden fehlerhaft abgeleitet oder bleiben konzeptionslos"] }
                ]
              }
            ]
          },
          praktisch: {
            title: "Praktische Prüfung",
            categories: [
              {
                id: "p_plan", title: "Anforderung: Planung", shortName: "Planung",
                indicators: [
                  { id: "p_plan_1", name: "Der Entwurf wird in seiner Gesamtdarstellung", grades: ["stringent und logisch strukturiert. Formale Vorgaben, Aspekte und Kriterien werden vollständig und fehlerfrei eingehalten", "überwiegend stringent und schlüssig strukturiert. Formale Vorgaben, Aspekte und Kriterien werden überwiegend fehlerfrei eingehalten", "zweckmäßig strukturiert. Formale Vorgaben, Aspekte und Kriterien werden im Wesentlichen eingehalten", "erkennbar und nachvollziehbar strukturiert. Formale Vorgaben, Aspekte und Kriterien werden mit erheblichen Einschränkungen eingehalten", "kaum strukturiert. Formale Vorgaben, Aspekte und Kriterien werden kaum eingehalten", "konzeptionslos. Formale Vorgaben, Aspekte und Kriterien werden nicht eingehalten"] },
                  { id: "p_plan_2", name: "Die fachliche Korrektheit", grades: ["wird vielschichtig (verdeutlichend differenziert) nachgewiesen", "wird fundiert nachgewiesen", "wird mit Abstrichen, aber zweckmäßig nachgewiesen", "wird punktuell und oberflächlich nachgewiesen", "wird kaum sinnvoll und lückenhaft nachgewiesen", "wird nicht oder fehlerhaft nachgewiesen"] },
                  { id: "p_plan_3", name: "Das Anwenden zielgruppenorientierter didaktischer, fachdidaktischer und pädagogischer Konzepte und Methoden", grades: ["wird vielschichtig und kompetent erörtert", "wird umfassend und schlüssig erläutert", "wird solide und zweckmäßig erörtert", "wird oberflächlich, aber hinreichend erörtert", "wird unzureichend erörtert", "ist konzeptionslos"] }
                ]
              },
              {
                id: "p_durch_bez", title: "Anforderung: Beziehungsqualität", shortName: "Beziehungsqualität",
                indicators: [
                  { id: "p_durch_bez_1", name: "Es wurde eine Lernatmosphäre geschaffen, welche die Entfaltung der Lernkompetenz jedes einzelnen Schülers", grades: ["im höchsten Maß gewährleistet", "zielgerichtet gewährleistet", "grundsätzlich gewährleistet", "punktuell gewährleistet", "wird kaum geschaffen", "wird nicht geschaffen"] },
                  { id: "p_durch_bez_2", name: "Die pädagogische Grundhaltung", grades: ["wird professionell zum Ausdruck gebracht", "wird überzeugend zum Ausdruck gebracht", "ist prinzipiell wahrnehmbar", "ist partiell wahrnehmbar", "ist unzureichend wahrnehmbar", "ist nicht wahrnehmbar"] }
                ]
              },
              {
                id: "p_durch_did", title: "Anforderung: Didaktik & Methodik", shortName: "Didaktik & Methodik",
                indicators: [
                  { id: "p_durch_did_1", name: "Der Unterrichtseinstieg", grades: ["wird optimal schülerorientiert gestaltet. Der individuelle Lern- und Kompetenzzuwachs wird optimal und professionell gesteuert", "wird gelungen und schülerorientiert gestaltet. Der individuelle Lern- und Kompetenzzuwachs wird überwiegend professionell und gelungen gesteuert", "wird praktikabel und schülerorientiert gestaltet. Der individuelle Lern- und Kompetenzzuwachs wird solide und zweckmäßig gesteuert", "wird bedingt schülerorientiert gestaltet. Der individuelle Lern- und Kompetenzzuwachs wird ansatzweise zweckmäßig gesteuert", "wird kaum schülerorientiert oder stockend gestaltet. Der individuelle Lern- und Kompetenzzuwachs wird unzureichend gesteuert", "wird nicht schülerorientiert und/oder falsch gestaltet. Der individuelle Lern- und Kompetenzzuwachs wird nicht oder falsch gesteuert"] },
                  { id: "p_durch_did_2", name: "Die Verstehens- und Aneignungsprozesse", grades: ["werden optimal ermöglicht und differenziert unterstützt", "werden umfassend ermöglicht und überwiegend differenziert unterstützt", "werden grundsätzlich ermöglicht und angemessen unterstützt", "werden ansatzweise ermöglicht und unterstützt", "werden kaum ermöglicht und unzureichend unterstützt", "werden nicht ermöglicht und nicht unterstützt"] },
                  { id: "p_durch_did_3", name: "Die Steuerung der Lernprozesse", grades: ["gelingt optimal und professionell", "gelingt zielgerichtet", "gelingt zweckmäßig", "ist erkennbar", "gelingt unzureichend", "gelingt nicht"] },
                  { id: "p_durch_did_4", name: "Die Reflexions- und Feedbackkultur", grades: ["ist konsequent entwickelt und wird nachhaltig gepflegt. In unerwarteten Situationen tritt der Prüfling professionell und souverän auf", "ist entwickelt und wird zielgerichtet gepflegt. In unerwarteten Situationen tritt der Prüfling überwiegend professionell und überzeugend auf", "ist grundsätzlich entwickelt und wird zweckmäßig gepflegt. In unerwarteten Situationen reagiert der Prüfling angemessen und tritt akzeptabel auf", "wird ansatzweise entwickelt. In unerwarteten Situationen wird ansatzweise zweckmäßig reagiert", "ist wenig entwickelt. In unerwarteten Situationen wird unzureichend reagiert", "ist nicht entwickelt. In unerwarteten Situationen wird nicht oder falsch reagiert"] }
                ]
              },
              {
                id: "p_durch_fach", title: "Anforderung: Fachlichkeit", shortName: "Fachlichkeit",
                indicators: [
                  { id: "p_durch_fach_1", name: "Die fachliche und fachsprachliche Korrektheit", grades: ["wird vielschichtig (differenziert, beispielhaft) nachgewiesen", "wird fundiert nachgewiesen", "wird grundsätzlich nachgewiesen", "wird hinreichend nachgewiesen", "wird kaum oder lückenhaft nachgewiesen", "wird nicht nachgewiesen"] }
                ]
              },
              {
                id: "p_durch_paed", title: "Anforderung: Klassenmanagement", shortName: "Klassenmanagement",
                indicators: [
                  { id: "p_durch_paed_1", name: "Das Klassenmanagement", grades: ["wird optimal geführt und nachhaltig umgesetzt. Sinnstiftendes Kommunizieren sowie die aktive und passive Sprachkompetenz der Schüler werden nachhaltig und sicher gefördert", "wird gelungen geführt und zielgerichtet umgesetzt. Sinnstiftendes Kommunizieren wird zielgerichtet gefördert", "wird solide geführt und tragfähig umgesetzt. Sinnstiftendes Kommunizieren wird zweckmäßig und angemessen gefördert", "wird erkennbar geführt und oberflächlich umgesetzt. Sinnstiftendes Kommunizieren wird im Ansatz gefördert", "wird unzureichend geführt und gefördert", "wird nicht oder konzeptionslos geführt und nicht gefördert"] }
                ]
              },
              {
                id: "p_refl", title: "Anforderung: Reflexion", shortName: "Reflexion",
                indicators: [
                  { id: "p_refl_1", name: "Erkenntnisse und Erfahrungen, Wertungen und Schlussfolgerungen", grades: ["werden im besonderen Maße und überzeugend fach- und sachlogisch erörtert", "werden umfassend und vorwiegend fach- und sachlogisch erörtert", "werden angemessen und im Wesentlichen fach- und sachlogisch erörtert", "werden oberflächlich und teilweise fach- und sachlogisch erörtert", "werden kaum erörtert", "werden nicht oder konzeptionslos erörtert"] },
                  { id: "p_refl_2", name: "Mehrperspektivität", grades: ["wird professionell erreicht", "wird zielgerichtet und schlüssig erreicht", "wird weitgehend und tragfähig erreicht", "wird ansatzweise erreicht", "wird kaum erreicht", "wird nicht erreicht"] },
                  { id: "p_refl_3", name: "Das Reflektieren des eigenen Verhaltens und dessen Wirkung im Prozess Transfer für den persönlichen Lernprozess", grades: ["wird logisch analysiert und beispielhaft erläutert", "wird umfassend analysiert und schlüssig erläutert", "wird angemessen analysiert und tragfähig erläutert", "wird oberflächlich analysiert und nachvollziehbar erläutert", "wird lückenhaft analysiert und kaum erläutert", "wird nicht analysiert"] }
                ]
              }
            ]
          }
        };

const CRITERIA_DIMS = [
  "Fachdidaktik & Struktur",
  "Klassenführung & Präsenz",
  "Unterrichtsplanung & Ziele",
  "Heterogenität & Differenzierung",
  "Diagnostik & Feedback",
  "Reflexion & Haltung"
];

const POINT_GROUPS = [
  [15, 14],
  [13, 12, 11],
  [10, 9, 8],
  [7, 6, 5],
  [4, 3, 2],
  [1, 0]
];

const POINT_MAPPING = {
  15: 0, 14: 0,
  13: 1, 12: 1, 11: 1,
  10: 2, 9: 2, 8: 2,
  7: 3, 6: 3, 5: 3,
  4: 4, 3: 4, 2: 4,
  1: 5, 0: 5
};

const COLUMN_COLORS = [
  { activeBg: '#16a34a', activeText: '#ffffff', label: 'Sehr gut' },
  { activeBg: '#0d9488', activeText: '#ffffff', label: 'Gut' },
  { activeBg: '#eab308', activeText: '#ffffff', label: 'Befriedigend' },
  { activeBg: '#f97316', activeText: '#ffffff', label: 'Ausreichend' },
  { activeBg: '#ef4444', activeText: '#ffffff', label: 'Mangelhaft' },
  { activeBg: '#64748b', activeText: '#ffffff', label: 'Ungenügend' }
];
