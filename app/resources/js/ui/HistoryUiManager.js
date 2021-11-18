/* eslint-env browser */
import SortManager from "../utils/sort.js";
import Config from "../utils/Config.js";
import {getSongFromSavedJson} from "../song/Song.js";
import { getWidth } from "../utils/HelperFunctions.js";

var observer, apiManager, storageManager, player, sortManager, isGenreView, isPlaylistView, htmlManager, // Die Klassen.
    btnHistoryView, dropdownBtn, dropdownEl, sortLastSwipedBtn, sortTitleBtn, sortGenreBtn, sortInterpretBtn, sortPlaylistBtn, // Die UI Elemente.
    historyTemplate, historyList, iconBarHeader, // Die Templates für die Anzeige.
    returningFromPlaylistSelection = false; // Ein boolean der darüber informiert ob man von der History zur Playlistauswahl und zurückgekommen ist.

// Diese Methode implementiert den Wechsel zur HistoryView in der Icon-Bar.
function initButtons() {
    initSortButtons();

    // Dem Button für die HistoryView im DOM wird ein EventListener hinzugefügt.
    btnHistoryView.addEventListener("click", function () {
        // Dem StorageManager wird mitgeteilt, dass das Abspielen pausiert ist.
        storageManager.setPaused();
        // Das Abspielen wird über den Player pausiert.
        player.pause();

        // Dem SortManager wird hiermit standardmäßig gesagt, er soll nach LastSwiped sortieren.
        sortManager.sortByLastSwiped();
        isGenreView = false;
        isPlaylistView = false;

        initHistory();
    });
    
}

// Diese Funktion fügt für ein übergebenes Song-Objekt ein Widget basierend auf dem HTML-Template in die Liste ein.
function addSongElementToList(song) {
    let newHistoryWidget = historyTemplate.cloneNode(true),
        newHistoryWidgetContent = newHistoryWidget.content,
        playButton,
        pauseButton,
        addToPlaylistButton,
        deleteButton;

    // Wenn es den Song schon einmal gibt (wird geschaut über das Song-Attribut isDuplicate) 
    // UND wenn nicht nach Playlist sortiert wird, dann wird die Methode abgebrochen.
    if (song.isDuplicate && !isPlaylistView) {
        return;
    }

    // Die Elemente des Widgets werden entsprechend des Song Objekts befüllt.
    newHistoryWidgetContent.getElementById("cover-history").src = song.coverImage;
    newHistoryWidgetContent.getElementById("Song-title-history").innerHTML = song.title;
    newHistoryWidgetContent.getElementById("Song-interpret-history").innerHTML = song.artist;

    playButton = newHistoryWidgetContent.querySelector(".play-history");
    deleteButton = newHistoryWidgetContent.querySelector(".delete-history");
    pauseButton = newHistoryWidgetContent.querySelector(".pause-history");
    addToPlaylistButton = newHistoryWidgetContent.querySelector(".addToPlaylist-history");

    // Wird der Play-Button gedrückt, soll der übergebene Song abgespielt werden, danach wird der pause Button angezeigt,
    // so kann man das Lied auch wieder stoppen.
    playButton.addEventListener("click", function () {
        storageManager.setResumed();

        //Alle Buttons werden auf die Standard-Ansicht (Play) zurückgesetzt.
        resetAllPauseButtons();
        resetAllPlaylistPauseButtons();

        playButton.classList.add("hidden");
        pauseButton.classList.remove("hidden");

        //Song wird über den apiManager abgespielt.
        apiManager.playSong(song.uri);
        if(getWidth() > Config.MIN_WIDTH_DISPLAYING_PLAYING_SONG) {
            iconBarHeader.innerHTML = "Currently Playing: " + song.title;
        }
        
    });

    // Stoppen eines abspielenden Songs bei Klick auf den Pausebutton.
    pauseButton.addEventListener("click", function () {
        storageManager.setPaused();
        apiManager.pausePlayback();

        // Der Playbutton wird wieder angezeigt.
        pauseButton.classList.add("hidden");
        playButton.classList.remove("hidden");
        iconBarHeader.innerHTML = "Swipe History";
    });

    // Wird der delete-Button gedrückt, wird der übergebene Song aus der Liste im LocalStorage entfernt.
    deleteButton.addEventListener("click", function () {
        //storageManager wird aus der gelikten Liste gelöscht
        storageManager.removeSongFromLikedList(song);

        // Die Ansicht wird neu geladen, der gelöschte Song verschwindet.
        initHistory();
    });

    // Wird der Add-Button gedrückt, wird der aktuelle Song zu dem die Karte gehört an die PlaylistSelection übergeben.
    addToPlaylistButton.addEventListener("click", function () {
        addSongFromHistoryToPlaylist(song);
    });

    // Der historyList wird das befüllte Template angehängt.
    historyList.appendChild(newHistoryWidgetContent);
}

// Sortiert nach zuletzt geswiped
function sortByLastSwiped() {
    storageManager.setPaused();
    player.pause();
    isGenreView = false;
    isPlaylistView = false;
    sortManager.sortByLastSwiped();
    iconBarHeader.innerHTML = "Swipe History";
    hideDropdown();
}

// Initialisiert die Buttons im HistoryView zum Sortieren der Song-Liste, 
// beim Klick wird die List nach dem jeweiligen Kriterium sortiert.
function initSortButtons() {
    //Last-swiped
    sortLastSwipedBtn.addEventListener("click", function () {
        sortByLastSwiped();
    });
    //Title
    sortTitleBtn.addEventListener("click", function () {
        clickedSortButton(Config.KEY_SORT_TITLE);
    });
    //Genre
    sortGenreBtn.addEventListener("click", function () {
        clickedSortButton(Config.KEY_SORT_GENRE);
    });
    //Interpret
    sortInterpretBtn.addEventListener("click", function () {
        clickedSortButton(Config.KEY_SORT_INTERPRET);
    });
    //Playlist
    sortPlaylistBtn.addEventListener("click", function () {
        clickedSortButton(Config.KEY_SORT_PLAYLIST);
    });
}

// wird aufgerufen, wenn man auf einen Sortier-Button im Dropdown klickt
function clickedSortButton(sortFunction) {
    // Player wird pausiert, iconBar zurückgesetzt und das Dropdown versteckt
    storageManager.setPaused();
    player.pause();
    iconBarHeader.innerHTML = Config.DEFAULT_ICON_BAR_TEXT;
    hideDropdown();

    // Je nach geklickter sortFunktion werden Variablen entsprechend gesetzt und and die entsprechende Methode im sortManager aufgerufen
    switch(sortFunction) {
        case Config.KEY_SORT_TITLE: 
            isGenreView = false;
            isPlaylistView = false;
            sortManager.sortByTitle();
            break;
        case Config.KEY_SORT_GENRE: 
            isGenreView = true;
            isPlaylistView = false;
            sortManager.sortByGenre();
            break;
        case Config.KEY_SORT_INTERPRET: 
            isGenreView = false;
            isPlaylistView = false;
            sortManager.sortByInterpret();
            break;
        case Config.KEY_SORT_PLAYLIST: 
            isGenreView = false;
            isPlaylistView = true;
            sortManager.sortByPlaylist();
            break;
        default: break;
    }
}

// Die initHistory-Funktion leert die Liste und fügt für jedes Song-Element im LocalStorage ein Widget hinzu.
function initHistory() {
    var swipedSongs = storageManager.swipedSongsList,
        currentGenre = "null",
        currentPlaylist = "null",
        addElements = true;

    // Liste wird geleert,
    historyList.innerHTML = "";

    // Kommt man von der Playlistauswahl zurück müssen die Elemente nicht neu zur Liste hinzugefügt werden.
    if(returningFromPlaylistSelection) {
        returningFromPlaylistSelection = false;
        isPlaylistView = false;
        addElements = false;
        sortByLastSwiped();
    }

    // Iteriert über alle geswipten Songs und erstellt zu jedem Genre eine Kategorie dazu.
    for (let i = swipedSongs.length - 1; i >= 0; i--) {
        // Je nachdem wie die Songs sortiert werden, werden Sektionen für die Playlist, das Genre oder nicht erstellt.
        if (isGenreView) {
            if (currentGenre !== swipedSongs[i].genre) {
                currentGenre = swipedSongs[i].genre;
                createGenreSection(currentGenre);
            }
        }
        if (isPlaylistView) {
            if (currentPlaylist !== swipedSongs[i].playlist) {
                currentPlaylist = swipedSongs[i].playlist;
                createPlaylistSection(currentPlaylist, swipedSongs[i].playlistId);
            }
        }
        if(addElements) {
            addSongElementToList(swipedSongs[i]);
        }
    }
}

// Das Song Objekt wird dupliziert (und als Duplikat markiert) und dann an die Playlistauswahl übergeben.
function addSongFromHistoryToPlaylist(song) {
    var duplicateSong = getSongFromSavedJson(song);
    duplicateSong.makeDuplicate();
    returningFromPlaylistSelection = true;
    storageManager.addSongToCurrentSessionLikedSongs(duplicateSong);
    storageManager.setComingFromHistory(true);

    htmlManager.changeToPlaylistSelection();
}

// Mit dieser Funktion wird ein Abschnitt für eine Playlist mit einem Play/Pause Button erzeugt.
function createPlaylistSection(playlistName, playlistId) {
    var playlistTitle = document.createElement("h1"),
        playlistPlayButton = document.createElement("img"),
        playlistPauseButton = document.createElement("img"),
        playlistNameEl = document.createElement("a");

    playlistPlayButton.classList.add("playlist-play");
    playlistPlayButton.setAttribute("src", "../icons/play_btn.png");

    playlistPauseButton.classList.add("playlist-pause");
    playlistPauseButton.classList.add("hidden");
    playlistPauseButton.setAttribute("src", "../icons/pause_btn.png");

    // Abspielen einer ganzen Playlist, Wechsel zur Anzeige des Pausebuttons:
    playlistPlayButton.addEventListener("click", function () {
        if(playlistName !== Config.PLAYLIST_NAME_DEFAULT) {
            storageManager.setResumed();
            apiManager.playPlaylist(playlistId);

            resetAllPlaylistPauseButtons();
            resetAllPauseButtons();

            playlistPlayButton.classList.add("hidden");
            playlistPauseButton.classList.remove("hidden");
            if(getWidth() > Config.MIN_WIDTH_DISPLAYING_PLAYING_SONG) {
                iconBarHeader.innerHTML = "Currently Playing: " + playlistName;
            }
        }
    });

    //Stoppen des Abspielens einer Playlist, Wechsel zum Playbutton:
    playlistPauseButton.addEventListener("click", function () {
        storageManager.setPaused();
        apiManager.pausePlayback();

        playlistPauseButton.classList.add("hidden");
        playlistPlayButton.classList.remove("hidden");
        iconBarHeader.innerHTML = "Swipe History";
    });

    playlistNameEl.innerHTML = playlistName;

    playlistTitle.classList.add("playlist-title");

    if(playlistName !== Config.PLAYLIST_NAME_DEFAULT) {
        playlistTitle.appendChild(playlistPlayButton);
        playlistTitle.appendChild(playlistPauseButton);   
    }
    playlistTitle.appendChild(playlistNameEl);

    historyList.appendChild(playlistTitle);
}

// Fügt eine  Sektionsüberschrift für ein Genre ein.
function createGenreSection(genre) {
    let genreTitle = document.createElement("h1");
    genreTitle.classList.add("genre-title");
    genreTitle.innerHTML = genre;
    historyList.appendChild(genreTitle);
}

// Alle Pausebuttons werden wieder zum Playbutton zurück gesetzt, 
// sobald eine Aktion eintritt bei der ein abspielender Song nicht mehr abgespielt werden soll.
function resetAllPauseButtons() {
    var allWidgets = document.querySelectorAll(".history-widgets");

    if (allWidgets !== undefined && allWidgets !== null && allWidgets.length !== 0) {
        for (let i = 0; i < allWidgets.length; i++) {
            let pauseButton = allWidgets[i].querySelector(".pause-history"),
                playButton = allWidgets[i].querySelector(".play-history");

            pauseButton.classList.add("hidden");
            playButton.classList.remove("hidden");

        }
    }
}

// Mit dieser Funktion werden alle Playlist-Pause-Knöpfe wieder verborgen und alle Play-Buttons wieder angezeigt.
function resetAllPlaylistPauseButtons() {
    var allPauseButtons = document.querySelectorAll(".playlist-pause"),
        allPlayButtons = document.querySelectorAll(".playlist-play");

    if (allPauseButtons !== undefined && allPauseButtons !== null && allPauseButtons.length !== 0) {
        for (let i = 0; i < allPauseButtons.length; i++) {
            allPauseButtons[i].classList.add("hidden");
            allPlayButtons[i].classList.remove("hidden");
        }
    }
}

// Anzeige der Dropdown elemente zum Sortieren der Song-Liste
function showDropdown() {
    var dropDownContent = document.getElementById("sortDropdownContent");
    if(dropDownContent !== null && dropDownContent !== undefined) {
        dropDownContent.classList.add("show");
    }
}

// Verstecken der Dropdown elemente zum Sortieren der Song-Liste
function hideDropdown() {
    var dropDownContent = document.getElementById("sortDropdownContent");
    if(dropDownContent !== null && dropDownContent !== undefined) {
        dropDownContent.classList.remove("show");
    }
}

// Diese Methode Lädt das Template für ein Widget im HistoryScreen
function templateLoaded(event) {
    historyTemplate = document.createElement("div");
    historyTemplate.innerHTML = event.data;
    historyTemplate = historyTemplate.firstChild;

    initHistory();
}

// ---- HistoryUIManager Klasse ---- 

class HistoryUIManager {
    // Dem Konstruktor werden die jeweilig richtigen Observer, Api-manager, ... Instanzen aus dem UIManager übergeben
    constructor(historyObserver, historyApiManager, historyStorageManager, historySongManager, historyPlayer, historyHtmlManager, iconBar) {
        observer = historyObserver;
        apiManager = historyApiManager;
        storageManager = historyStorageManager;
        player = historyPlayer;
        htmlManager = historyHtmlManager;
        iconBarHeader = iconBar;

        // Da der sortManager nur in dieser Klasse gebraucht wird, wird er direkt hier initalisiert.
        sortManager = new SortManager(storageManager, initHistory);

        isGenreView = false;
        isPlaylistView = false;
    }

    setListeners() {
        // Es werden dem observer Event-Listener hinzugefügt
        // wenn der Benutzer auf das History-View Icon drückt -> init() Methode wird aufgerufen
        observer.addEventListener(Config.CHANGED_TO_HISTORY_VIEW, this.init);
        // Wenn das History-Card Template fertig geladen hat, wird die Methode templateLoaded() aufgerufen
        observer.addEventListener(Config.HISTORY_CARD_TEMPLATE_READY, templateLoaded);
    }

    init() {
        // Buttons werden vom DOM geladen
        btnHistoryView = document.getElementById("historyBtn");
        historyList = document.getElementById("history-widget-list");
        dropdownBtn = document.querySelector(".dropdown-btn");
        dropdownEl = document.querySelector(".sort-dropdown-menu");
        sortLastSwipedBtn = document.querySelector(".sortLastSwipedBtn");
        sortTitleBtn = document.querySelector(".sortTitleBtn");
        sortGenreBtn = document.querySelector(".sortGenreBtn");
        sortInterpretBtn = document.querySelector(".sortInterpretBtn");
        sortPlaylistBtn = document.querySelector(".sortPlaylistBtn");

        // Template für die History wird vom htmlManager angefragt (bei Fertigstellung wird der Observer und somit templateLoaded() aufgerufen)
        if(historyTemplate === undefined || historyTemplate === null) {
            htmlManager.getHistoryCardTemplate();
        } else {
            // Wenn das HistoryTemplate schon initalisiert ist, wird nur die Methode initHistory() aufgerufen
            initHistory();
        }
        
        // Event-Listener für das Klicken auf den Dropdown Button
        dropdownBtn.addEventListener("click", showDropdown);
        dropdownEl.addEventListener("mouseover", showDropdown);
        dropdownEl.addEventListener("mouseout", hideDropdown);

        initButtons();
    }

    // Diese Methode fügt Song der Liste hinzu (erstellt neues widget im HistoryScreen)
    addSongToList(song) {
        addSongElementToList(song);
    }

    // Diese Methode ertstellt die Überschrift für eine Playlist beim sortieren nach Playlists im HistoryScreen
    createPlaylist(playListName, playlistId) {
        createPlaylistSection(playListName, playlistId);
    }

    // Diese Methode erstellt im HistoryScreen eine bestimmte Genre-Section beim sortieren der Songs nach Genre
    createGenre(name) {
        createGenreSection(name);
    }

    // Diese Methode setzt alle Buttons auf das "Play"-Symbol zurück.
    resetPausedButtons() {
        resetAllPauseButtons();
        resetAllPlaylistPauseButtons();
    }

    // Diese Methode zeigt den HistoryScreen an.
    showHistoryView(){
        sortManager.sortByLastSwiped();
        isGenreView = false;
        isPlaylistView = false;

        initHistory();
    }

    // Diese Methode versteckt den HisoryScreen.
    hide() {
        document.getElementById("history-screen").classList.add("hidden");
    }
}

export default HistoryUIManager;