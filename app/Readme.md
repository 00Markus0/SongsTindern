# Quellcode (Client)

Wir haben verschiedene JavaScript Komponenten:
- MainViews (kümmert sich um die StartView) 
- UIManager (wechselt zwischen den verschiedenen UIs)
  - HtmlManager (lädt die Html Struktur für die verschieden UIs)
  - Toast (zeigt Toasts für den Benutzer an)
  - SwipeUiManager (kapselt die Funktionalität für die Swipe View)
  - PlaylistSelectionUiManager (bündelt die Informationen des Playlist Seletion View)
  - HistoryUiManager (kümmert sich um die History View)
  - StatisticsUiManager (behandelt die Statistics View)
- GameManager (behandelt zentrale Funktionen wie die GameModes)
- SongManager (verwaltet geladene Songs)
  - Song (Klasse, die einen einzelnen Song darstellt)
- StorageManager (kapselt alle Funktionalitäten in Bezug auf LocalStorage)
- ApiManager (stellt die Verbindung mit der Spotify-API her)
  - Authentificator (kümmert sich um das Authentifizieren bei Spotify)
- Countdown (Implementierung für das zeitlich begrenzte Swipen) 
- sort (Funktionalität für das Sortieren von Songgs nach einem Kriterium)
- HelperFunctions (bietet Funktionen, die an mehreren Stellen benötigt werden)
- Observer (Implementierung des Observer-Patterns mit Hilfe von Events)
  - HelperEvents (Deklaration eigener Events für den Observer)
- Config (Zusammenfasssung von Konstanten)

Dazu haben wir 3 CSS-Dateien:
 - CSS für mobile Plattformen
 - CSS für Tablets (zwischen Mobil und Desktop)
 - CSS für klassische PCs und Laptops

Als HTML-Komponenten haben wir:
- mainViews, die Basis unserer Anwendung, hier werden die HTML-Elemente für die verschiedenen Ansichten eingefügt
- HTML-Dateien, die mit den entsprechenden Screens korrespondieren:
  - startScreen
  - historyScreen
  - playlistSelectionScreen
  - statisticsScreen
  - swipeScreen
- HTML-Datei für die iconBar
- HTML-Templates für verschiedene gleichartig öfters auftretende UI-Komponenten:
  - historyCardTemplate für die Anzeige eines Songs in der History
  - playlistSelectionPlaylistTemplate, Aussehen einer Playlist in der Playlistauswahl
  - playlistSelectionSongTemplate, Aussehen eines Songs in der Playlistauswahl
  - tinderCardTemplate, Aussehen eines Songs beim swipen
