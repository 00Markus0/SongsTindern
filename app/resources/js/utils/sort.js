/* eslint-env browser */
import { playlistDecisionFunction, genreDecisionFunction, interpretDecisionFunction, lastSwipedDecisionFunction, titleDecisionFunction } from "./HelperFunctions.js";

// Diese Datei stellt Funktionalität zum Sortieren von Songs bereit.

var sortStorageManager,
    initHistoryMethod;

// Diese Klasse erlaubt es Songs in der History nach verschiedenen Kriterien zu sortieren.
class SortManager {

    constructor(storageManager, initHistory){
        initHistoryMethod = initHistory;
        sortStorageManager = storageManager;
    }

    // Sortieren nach zuletzt geswiped.
    sortByLastSwiped(){
        sort(lastSwipedDecisionFunction);
    }

    // Sortieren nach Titel (Alphabet).
    sortByTitle(){
        sort(titleDecisionFunction);
    }

    // Sortieren nach Genre (Alphabet).
    sortByGenre(){
        sort(genreDecisionFunction);
    }

    // Sortieren nach Interpret(Alphabet).
    sortByInterpret(){
        sort(interpretDecisionFunction);
    }

    // Sortieren nach in Playlist enthalten (können in mehreren Playlist vorhanden sein).
    sortByPlaylist(){
        sort(playlistDecisionFunction);
    }

}

// Funktion um die Songs im Speicher nach einem bestimmten Kriterium zu sortieren.
// Nach dem Sortieren wird die Liste gespeichert und die Anzeige-Methode des HistoryViews gestartet.
function sort(sortTypeFunction) {
    var swipedSongs = sortStorageManager.swipedSongsList;
    
    swipedSongs.sort(sortTypeFunction);
    
    sortStorageManager.callSaveSwipedList(swipedSongs);

    initHistoryMethod();
}
    
export default SortManager;