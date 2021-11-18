/* eslint-env browser */
import { fetchHtmlAsText} from "../utils/HelperFunctions.js";
import { playlistSelectionPlaylistTemplateEvent, playlistSelectionSongTemplateEvent, 
    tinderTemplateReadyEvent, historyTemplateReadyEvent, IconBarReadyEvent, HistoryViewReadyEvent, 
    SwipeViewReadyEvent, StatisticsViewReadyEvent, StartViewReadyEvent, SettingsSpeedReadyEvent, SettingsDetailsReadyEvent,
    PlaylistSelectionReadyEvent} from "../utils/HelperEvents.js";

// In dieser Datei wird Funktionalität zum Wechsel zwischen den Ansichten, die in unterschiedlichen HTML-Dateien liegen, bereitgestellt.

var screenView, // HTML-DOM-Element in das die geladenen Anischten eingefügt werden müssen.
    iconBarView, // HTML-DOM-Element in dass die Icons eingefügt werden müssen.
    observer; // Observer-Objekt zur Kommunikation mit der restlichen Anwendung.

// Die HtmlManager-Klasse bietet Methoden zum Wechsel der Ansicht nach außen an.
class HtmlManager{

    constructor(mainViewObserver){
        observer = mainViewObserver;
        // holt sich die screenView und die iconBar aus dem HTMl und speichert es als Klassenvariable ab
        screenView = document.querySelector(".screen-views");
        iconBarView = document.querySelector(".icon-bar");
    }

    //Funktionen zum Wechseln der Ansicht
    async changeToSwipeScreen(){
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/swipeScreen.html"); // html zu Swipeview
        observer.notifyAll(new SwipeViewReadyEvent());
    }

    async changeToHistoryScreen(){
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/historyScreen.html"); // html zu History view
        observer.notifyAll(new HistoryViewReadyEvent());
    }

    async changeToStatisticsScreen(){
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/statisticsScreen.html"); // html zu statistics view
        observer.notifyAll(new StatisticsViewReadyEvent());
    }

    async changeToStartScreen(){
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/startScreen.html"); // html zu start view
        observer.notifyAll(new StartViewReadyEvent());
    }

    async changeToSettingsScreenDetails(){
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/detailsSettingsScreen.html"); // html zu detail setting view
        observer.notifyAll(new SettingsDetailsReadyEvent());
    }

    async changeToSettingsScreenSpeed(){
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/speedSettingsScreen.html"); // html zu speed setting view
        observer.notifyAll(new SettingsSpeedReadyEvent());
    }

    async changeToPlaylistSelection() {
        screenView.innerHTML = "";
        screenView.innerHTML = await fetchHtmlAsText("../html/playlistSelectionScreen.html");
        observer.notifyAll(new PlaylistSelectionReadyEvent());
    }

    // Diese Funktion fügt die Iconbar hinzu.
    async addIconbar(){
        iconBarView.innerHTML = "";
        iconBarView.innerHTML = await fetchHtmlAsText("../html/iconBar.html"); // html zur IconBar
        observer.notifyAll(new IconBarReadyEvent());
    }

    //Funktionen zum beschaffen der Templates.
    async getTinderCardTemplate(){
        observer.notifyAll(new tinderTemplateReadyEvent(await fetchHtmlAsText("../html/tinderCardTemplate.html"))); // html zum Template eines Songs (beim swipen)
    }

    async getHistoryCardTemplate(){
        observer.notifyAll(new historyTemplateReadyEvent(await fetchHtmlAsText("../html/historyCardTemplate.html"))); // html zum Template der HistoryView
    }

    async getPlaylistSelectionSongTemplate() {
        observer.notifyAll(new playlistSelectionSongTemplateEvent(await fetchHtmlAsText("../html/playlistSelectionSongTemplate.html"))); // html zum Template der Song Selection
    }

    async getPlaylistSelectionPlaylistTemplate() {
        observer.notifyAll(new playlistSelectionPlaylistTemplateEvent(await fetchHtmlAsText("../html/playlistSelectionPlaylistTemplate.html"))); // html zum Template der Playlist Selection
    }

}

export default HtmlManager;
