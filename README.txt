TIG ISI TARIFLERI - APP
=======================

Aufbau
  index.html            Startseite (Kacheln, Suche, Teilen-Button)
  projects.js           Liste aller Tarife
  anleitungen/          pro Tarif eine HTML-Datei
  assets/               Titelbilder und App-Icons
  manifest.webmanifest  macht die Seite installierbar
  sw.js                 Offline-Funktion
  merke.js              merkt sich, wo man im Tarif aufgehoert hat
  video.js              spielt "Videoda göster" direkt in der Seite ab (nur der Abschnitt)

Neue Anleitung hinzufuegen
  1. Anleitung als HTML bauen und nach anleitungen/<name>.html legen
     (Leiste oben + Teilen-Button aus ayicikli-yildiz-tulum.html uebernehmen,
     und ganz unten vor </body>: <script src="../merke.js"></script>
     <script src="../video.js"></script>).
  2. Titelbild nach assets/cover-<name>.jpg legen.
  3. In projects.js einen neuen Block eintragen.
  4. In sw.js die VERSION erhoehen (v1 -> v2), damit Mamas Handy es neu laedt.
  5. Hochladen (GitHub Pages).

Auf Mamas Handy installieren
  Android (Chrome):  Menue (3 Punkte) -> Zum Startbildschirm hinzufuegen
  iPhone (Safari):   Teilen-Symbol -> Zum Home-Bildschirm
