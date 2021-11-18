# Software Design für Songs Tindern #

[comment]:# (Beschreiben Sie hier die intendierte Code-Struktur Ihrer Anwendung. Notieren Sie wesentliche Module oder Konzepte, entlang derer sich Ihre Anwendung strukturieren lässt. Gehen Sie dabei auch auf grundlegende Architekturen, z.B. die Unterscheidung von Server- und Client-Anwendung ein und beschreiben Sie die Art und Weise, wie Teilkomponenten miteinander kommunizieren werden. Entwerfen Sie Strukturen und Vorgaben für zentrale Datenobjekte und geben Sie an, welche Teilbereiche der Anwendung unter Verwendung externe APIs oder Bibliotheken umgesetzt werden sollen. Erweitern und Überarbeiten Sie dieses Dokument im Verlauf des Projektes. Hier soll stets eine aktuelle Dokumentation des aktuell geplanten bzw. umgesetzten Software Designs einsehbar sein.)

## Benutzungs-Hinweise ##

Zur Benutzung unserer Anwednung ist ein **Spotify-Premium Account erforderlich**, mit dem man sich am Anfang anmelden muss. Da sich unsere Anwendung noch in der Entwicklungsphase befindet, verhindert Spotify die Nutzung unserer Anwendung generell für alle Nutzer. Um diese Beschränkung aufzuheben muss man die **E-Mail Adresse** aller Nutzer, die Zugriff erhalten sollen **speziell angeben**. Dies kann nur von dem Teammitglied durchgeführt werden, der unser System bei Spotify angemeldet hat. 
Nachdem die Entwicklungsphase beendet ist, kann man von Spotify das Projekt prüfen lassen, um eine genrelle Freigabe zu erhalten. (vgl. https://developer.spotify.com/community/news/2021/05/27/improving-the-developer-and-user-experience-for-third-party-apps/)

Zu beachten ist auch, dass im vom Browser simulierten Touchmodus kein Doppelklick mit dem simulierten Finger erkannt werden kann. Auf einem echten Touchdisplay funktioniert der Doppelklick im Touchmodus trotzdem.

Die Anwendung wurde zwar im mehreren Browsern getestet, jedoch haben wir primär in Google Chrome entwickelt und getestet.

## Komponenten ##

Für unser Projekt benötigen wir verschiedene Klassen:
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

## Konzepte ##

Bei der Implementation unserer Anwendung haben wir folgende Programmierkonzepte verwendet:
- Observer-Pattern (Kommunikation von Informationen zwischen den verschiedenen Modulen)
- LocalStorage (sitzungsübergreifendes Speichern von Informationen)
- Fetch (Laden von u.a. Html-Elementen)
- Promises (Warten auf das Ergebnis einer zeitlich nicht abschätzbaren Anweisung)
- JSON (Umwandlung von Strings in Objekte)

## Bibliotheken & APIs ##

Für die Umsetzung unserer Anwendung haben wir folgende Libraries benötigt:
- [hammer.js](http://hammerjs.github.io/) (ermöglicht die Navigation und Animation beim Swipen der Song-cards)
    - Für die Implementierung der Tinderkarten wurde folgende Quelle verwendet: https://codepen.io/RobVermeer/pen/japZpY (zuletzt aufgerufen am 28.09.2021, MIT License https://opensource.org/licenses/MIT)
- [Chart.js](https://www.chartjs.org/) (bietet die Möglichkeit für das Anzeigen von Donut-Charts)

Außerdem verwenden wir folgende APIs:
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) (Verbindung zu Spotify)
- [Spotify Web Playback Sdk](https://developer.spotify.com/documentation/web-playback-sdk/) (Web-Player von Spotify)


## Umsetzung ##

Unsere Features setzen wir wie folgt um:
- Anmeldung:
  - über Spotify Web API mit Hilfe von Autorisierung
  - wenn der Nutzer sich anmeldet und zurück auf die Webseite geleitet wird steht ein Code in der URL, der ausgelesen wird
  - mit diesem Code lässt sich ein Token von der API abrufen, der gespeichert wird
  - dieser Token läuft nach 60 min ab, d.h. man muss bei jeder API-Anfrage schauen, ob der Token noch gültig ist
  - dieser Token muss außerdem bei jeder Anfrage an die API übergeben werden
  - vgl. https://developer.spotify.com/documentation/general/guides/authorization-guide/
- Zufälliger Song:
  - funktioniert über search query (https://developer.spotify.com/documentation/web-api/reference/#category-search)
  - man nimmt zwei zufällige Buchstaben aus einem Buchstaben-Array und stellt eine Suchanfrage damit an die API
  - Aus den Ergebnissen nimmt man eine zufällige Ergebnis (mit einer zufälligen Zahl zwischen 1 und 1000)
- Song abspielen:
  - über Spotify Web Playback SDK
  - erst wird ein neuer Player erzeugt
  - dieser wird dann über die Web API mit Hilfe von PUT gestartet
  - vgl. https://developer.spotify.com/documentation/web-api/reference/#category-player und https://developer.spotify.com/documentation/web-playback-sdk/quick-start/
- Playlist
  - Wenn der Benutzer fertig mit Swipen ist, gelangt er auf eine neue Seite. Auf dieser kann er den Namen einer Playlist eingeben oder die gelikten Songs zu einer bereits in der Anwendung erstellten Playlist hinzufügen
  - dabei wird die Playlist mitHilfe des POST Befehls über die API direkt auf dem Profil des Nutzers angelegt und alle gelikten Songs hinzugefügt
  - vgl. https://developer.spotify.com/documentation/web-api/reference/#category-playlists
- Song-Details
  - Speichern des zufällig ausgesuchten Songs in einer neuen Song-Instanz
  - beinhaltet alle Details zu einem Song wie Titel, Interpret, Cover, duration oder Audio Features (Länge des Songs)
  - vgl. https://developer.spotify.com/documentation/web-api/reference/#objects-index
- Countdown
  - wird aufgerufen wenn Benutzer einen entsprechenden GameMode gewählt hat
  - ruft sich selbst jede Sekunde auf und schaut, ob die Zeit schon abgelaufen ist
