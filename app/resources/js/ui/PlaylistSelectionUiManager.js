/* eslint-env browser */
import Config from "../utils/Config.js";
import { getSongFromSavedJson } from "../song/Song.js";
import Toast from "./Toast.js";
import { removeSongFromList } from "../utils/HelperFunctions.js";

// In dieser Datei werden Funktionen zur Manipulation des Playlistauswahl-Bildschirms implementiert.

var apiManager, observer, htmlManager, storageManager, // Objekte die gebraucht werden.
  likedSongs, playlists, // Listen der hinzuzufügenden Songs und zur Verfügung stehenden Playlists.
  playlistTemplate, songTemplate, // Templates
  list, // HTML-DOM-Element in dass die Elemente eingefügt werden müssen.
  isCheckedList, alreadyInList, playlistWasSelected; // Booleans zur Speicherung des aktuellen Zustands.

// Diese Funktion wird aufgerufen, wenn die HTML-Datei zur Playlist-Auswahl asynchron geladen wurde
// und Initialisiert alle notwendigen Elemente zur weiteren Verwendung.
function init() {
  likedSongs = storageManager.currentLikes;
  playlists = storageManager.playlistsList;

  // Falls keine Songs verwaltet werden müssen wird die Auswahl direkt beendet.
  if (likedSongs === null || likedSongs.length === 0) {
    finishSelection();
    return;
  }

  if (storageManager.fromHistory) {
    // Falls die Ansicht von der History geöffnet wurde, werden die Texte angepasst, man kommt bei Klick auf den Fertig-Button zurück in die History und Playlists in denen der Song schon ist werden mit einem grünen Haken markiert.
    document.querySelector("#selection-finished-btn").innerHTML ="Back to history";
    document.querySelector("#selection-finished-btn").addEventListener("click", backToHistory);
    observer.notifyAll(new Event(Config.TOGGLE_ICON_BAR_EVENT, null));
    alreadyInList = getPlaylistsSongIsAlreadyIn(likedSongs[0]);
    storageManager.setComingFromHistory(false);
    Toast.sendHistoryAddToast(likedSongs[0].title);
  } else {
    document.querySelector("#selection-finished-btn").addEventListener("click", finishSelection);
    Toast.sendPlaylistSelectionToast();
  }

  // Die Funktionalität des Wechsels zwischen Song- und Playlistansicht wird implementiert.
  list = document.querySelector("#playlist-selection-list");
  playlistWasSelected = false;
  document.querySelector("#show-playlists-btn").addEventListener("click", showPlaylistList);
  document.querySelector("#show-songs-btn").addEventListener("click", showSonglist);
 // Die notwendigen Templates werden asynchron geladen.
  htmlManager.getPlaylistSelectionSongTemplate();
  htmlManager.getPlaylistSelectionPlaylistTemplate();
}

// Diese Funktion fügt alle Playlists, in denen der Song aus der History schon vertreten ist einer Liste hinzu, damit der Song nicht mehrmals zur gleichen Playlist hinzugefügt werden kann.
function getPlaylistsSongIsAlreadyIn(song) {
  var currlist = [], 
      allSongs = storageManager.swipedSongsList;
  for (let i = 0; i < allSongs.length; i++) {
    if (allSongs[i].id === song.id) {
      currlist.push(allSongs[i].playlist);
    }
  }
  return currlist;
}

// Kommt man von der History View, kommt man mit dieser Funktion bei Klick auf den Return-Button zurück in diesen.
function backToHistory() {
  apiManager.pausePlayback();
  storageManager.clearCurrentSessionLikedSongs();
  htmlManager.changeToHistoryScreen();
  observer.notifyAll(new Event(Config.TOGGLE_ICON_BAR_EVENT, null));
  isCheckedList = undefined;
  alreadyInList = undefined;
  playlistWasSelected = false;
}

// Diese Funktion startet das Abspielen des übergebenen Songs.
function playSong(song) {
  storageManager.setResumed();
  apiManager.playSong(song.uri);
}

// Diese Funktion setzt die HTML-DOM-Liste zurück.
function clearList() {
  list.innerHTML = "";
}

// Diese Funktion zeigt das übergebene Song-Objekt basierend auf dem Song-Template in der Liste an.
function addSongElementToList(song) {
  var newSongWidget = songTemplate.cloneNode(true),
    newSongWidgetContent = newSongWidget.content,
    playButton, pauseButton, deleteButton;

  // Die HTML-Elemente des Templates werden befüllt.
  newSongWidgetContent.getElementById("cover-liked").src = song.coverImage;
  newSongWidgetContent.getElementById("Song-title-liked").innerHTML = song.title;
  newSongWidgetContent.getElementById("Song-interpret-liked").innerHTML = song.artist;

  playButton = newSongWidgetContent.querySelector(".play-song");
  pauseButton = newSongWidgetContent.querySelector(".pause-song");
  deleteButton = newSongWidgetContent.querySelector(".delete-song");

  // Wird der Playbutton geklickt wird der Song abgespielt und der Pause-Button angezeigt.
  playButton.addEventListener("click", function() {
    playSong(song);
    resetAllPauseButtons();

    playButton.classList.add("hidden");
    pauseButton.classList.remove("hidden");
  });

  // Der Pausebutton pausiert das Abspielen und zeigt den Playbutton wieder an.
  pauseButton.addEventListener("click", function() {
    pausePlayback();

    playButton.classList.remove("hidden");
    pauseButton.classList.add("hidden");
  });

  // Der DeleteButton entfernt einen Song aus der Liste der gelikten Songs, so dass dieser nicht mehr angezeigt und in die Playlist hinzugefügt wird.
  deleteButton.addEventListener("click", function() {
    removeSongFromList(song, likedSongs);
    pausePlayback();
    if(likedSongs.length <= 0) {
      // Wurden alle Songs per delete entfernt wird die Playlistauswahl beendet, da sie nicht mehr sinnvoll ist.
      finishSelection();
    } else {
      showSonglist();
    }
  });

  list.appendChild(newSongWidgetContent);
}

function pausePlayback() {
  storageManager.setPaused();
  apiManager.pausePlayback();
}

// Setzt alle Pausebuttons wieder auf Playbuttons zurück.
function resetAllPauseButtons() {
  var allWidgets = document.querySelectorAll(".song-controls");

  if (allWidgets !== undefined && allWidgets !== null && allWidgets.length !== 0) {
      for (let i = 0; i < allWidgets.length; i++) {
          let pauseButton = allWidgets[i].querySelector(".pause-song"),
              playButton = allWidgets[i].querySelector(".play-song");

          pauseButton.classList.add("hidden");
          playButton.classList.remove("hidden");

      }
  }
}

// Diese Funktion zeigt alle gelikten Songs in der ul-Liste an.
function showSonglist() {
  clearList();
  document.querySelector("#show-playlists-btn").classList.remove("active-nav-btn");
  document.querySelector("#show-songs-btn").classList.add("active-nav-btn");
  for (let i = 0; i < likedSongs.length; i++) {
    addSongElementToList(likedSongs[i]);
  }
}

// Diese Funktion erzeugt für das übergebene Playlist-Objekt ein Playlist-Listenelement basierend auf dem Template.
function addPlaylistElementToList(playlist, id, isChecked) {
  var newPlaylistWidget = playlistTemplate.cloneNode(true),
    newPlaylistWidgetContent = newPlaylistWidget.content,
    addButton,
    addedButton,
    playlistIsChecked = isChecked;

  newPlaylistWidgetContent.getElementById("playlist-name").innerHTML = playlist.name;
  addedButton = newPlaylistWidgetContent.querySelector(".check-mark");

  // Wird der addButton geklickt werden die Songs zur Playlist hinzugefügt und das Plus gegen einen Check ausgewechselt.
  addButton = newPlaylistWidgetContent.querySelector(".choosePlaylist");
  addButton.addEventListener("click", function() {
    addSongsToPlaylist(playlist.name, playlist.id);
    addButton.classList.add("hidden");
    addedButton.classList.remove("hidden");
    isCheckedList[id] = true;
    Toast.sendPlaylistSelectionAddToast(playlist.name);
  });

  refreshButtonAppearance(playlist, id, playlistIsChecked, addButton, addedButton);
  list.appendChild(newPlaylistWidgetContent);
}

// ändert die Buttons je nachdem ob Songs schon zu einer Playlist hinzugefügt wurden oder nicht
function refreshButtonAppearance(playlist, id, playlistChecked, addButton, addedButton) {
  let playlistIsChecked = playlistChecked;
  if (alreadyInList !== undefined) {
    if (alreadyInList.includes(playlist.name)) {
      playlistIsChecked = true;
    }
  }

  // Wird übergeben, dass die Playlist ein Check haben soll, oder ist in der Liste hinterlegt, dass die Playlist schon geklickt wurde, wird das Plus direkt gegen ein Check ausgetauscht.
  if (playlistIsChecked !== undefined) {
    if (playlistIsChecked === true) {
      addButton.classList.add("hidden");
      addedButton.classList.remove("hidden");
    }
  }

  if (isCheckedList[id] !== undefined) {
    if (isCheckedList[id]) {
      addButton.classList.add("hidden");
      addedButton.classList.remove("hidden");
    }
  }
  
}

// Diese Funktion erzeugt das erste Element der Playlist-Liste, dass auf einem Template basiert, statt dem Namen der Playlist aber ein Eingabefeld hat.
function initNewPlaylistInput() {
  var inputEl = document.createElement("input"),
      newPlaylistWidget = playlistTemplate.cloneNode(true),
      newPlaylistWidgetContent = newPlaylistWidget.content,
      addButton, 
      text;

  inputEl.classList.add("playlist-name-input");
  inputEl.placeholder = "Input new Playlist name";
  inputEl.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      createPlaylistFromInput(inputEl);
    }
  });

  text = newPlaylistWidgetContent.getElementById("playlist-name");
  text.parentNode.replaceChild(inputEl, text);

  addButton = newPlaylistWidgetContent.querySelector(".choosePlaylist");
  addButton.addEventListener("click", function() {
      createPlaylistFromInput(inputEl);
    });

  list.appendChild(newPlaylistWidgetContent);
}

// erstellt eine Playlist mit dem Inhalt des InputElements
function createPlaylistFromInput(inputElement) {
  let inputContent = inputElement.value;
  if (inputContent !== null && inputContent !== "") {
    createPlaylist(inputContent);
    inputElement.value = "";
  }
}

// Diese Funktion zeigt alle gespeicherten Playlists im ul-Element an.
function showPlaylistList() {
  apiManager.pausePlayback();
  clearList();

  // Damit bei einem Wechsel zu den gelikten Songs die Checks erhalten bleiben wird in dieser Liste gespeichert, welche Positionen einen Check statt einem plus brauchen.
  if (isCheckedList === undefined) {
    isCheckedList = [];
    for (let i = 0; i < playlists.length; i++) {
      isCheckedList.push(false);
    }
  }

  document.querySelector("#show-playlists-btn").classList.add("active-nav-btn");
  document.querySelector("#show-songs-btn").classList.remove("active-nav-btn");

  initNewPlaylistInput();

  for (let i = 0; i < playlists.length; i++) {
    addPlaylistElementToList(playlists[i], i);
  }
}

// Diese Funktion fügt der mit Name und Id spzifizierten Playlist die gelikten Songs hinzu.
function addSongsToPlaylist(name, id) {
  var savedSongsList = storageManager.swipedSongsList,
      newSavedSongsList = [...savedSongsList],
      duplicated = [];
  
  apiManager.addMultipleSongsToPlaylist(likedSongs, id);

  // Für die Sortierung in der History werden die Playlistnamen in den Song-Objekten gespeichert.
  for (let i = 0; i < savedSongsList.length; i++) {
    for (let j = 0; j < likedSongs.length; j++) {
      if (savedSongsList[i].id === likedSongs[j].id) {
        if (savedSongsList[i].playlist === Config.PLAYLIST_NAME_DEFAULT) {
          newSavedSongsList[i].setPlaylist(name, id);
          break;
        }
        // Gibt es schon eine Playlist die im Song-Objekt gespeichert wurde, wird ein Duplikat erzeugt, dass nur in der Sortierung nach Playlists angezeigt wird.
        else if (!(duplicated.includes(savedSongsList[i].id))) {
          let newSongDuplicate = JSON.stringify(savedSongsList[i]);
          newSongDuplicate = getSongFromSavedJson(JSON.parse(newSongDuplicate));

          newSongDuplicate.setPlaylist(name, id);
          newSongDuplicate.makeDuplicate();

          newSavedSongsList.push(newSongDuplicate);
          duplicated.push(newSongDuplicate.id);
          break;
        }
      }
    }
  }

  storageManager.saveSavedSongsList(newSavedSongsList);
  playlistWasSelected = true;
}

// Diese Funktion wird aufgerufen, wenn eine Playlist erstellt wurde.
// Dann wird die Playlist der Liste im LocalStorage und der Liste in dieser Datei hinzugefügt und ein neues Playlist-Element mit einem Check-Marker der HTML-Liste hinzugefügt.
function playlistCreated(event) {
  var newPlaylist = storageManager.addToPlaylists(storageManager.currentPlaylist, event.data);

  addSongsToPlaylist(newPlaylist.name, event.data);

  playlists.push(newPlaylist);
  isCheckedList.push(true);
  addPlaylistElementToList(newPlaylist, isCheckedList.length, true);

  Toast.sendNewPlaylistToast(newPlaylist.name);
}

// Diese Funktion erzeugt eine Playlist mit dem übergebenen Namen und speichert diesen zwischen.
function createPlaylist(name) {
  storageManager.setNewPlaylistName(name);
  apiManager.createNewPlaylist();
}

// Diese Funktion wird aufgerufen, wenn der end-Playlist-Button im SwipeView gedrückt wird.
// Dann wird die HTML-Datei des Auswahl-Screens asynchron geladen.
function startPlaylistSelection() {
  htmlManager.changeToPlaylistSelection();
}

// Durch Aufruf dieser Funktion werden die Attribute zurückgesetzt.
function reset() {
  storageManager.clearCurrentSessionLikedSongs();
  observer.notifyAll(new Event(Config.TOGGLE_ICON_BAR_EVENT, null));
  isCheckedList = undefined;
}

// Durch den Aufruf dieser Funktion, werden die Attribute zurückgesetzt und man gelangt zurück zum Startbildschirm.
function finishSelection() {
  apiManager.pausePlayback();
  reset();

  storageManager.clearCurrentRoundLikedSongs();

  htmlManager.changeToStartScreen();
  if (playlistWasSelected) {
    Toast.sendPlaylistsOnSpotifyToast();
  }
  playlistWasSelected = false;
  storageManager.setGameStopped();
}

// Wenn das Template für die Anzeige von Songs geladen hat, wird dieses gespeichert. 
function songTemplateLoaded(event) {
  songTemplate = document.createElement("div");
  songTemplate.innerHTML = event.data;
  songTemplate = songTemplate.firstChild;
}

// Wenn das Template für die Anzeige von Playlists in der Liste geladen hat, wird dieses gespeichert und es kann die Playlist-Liste angezeigt werden.
function playlistTemplateLoaded(event) {
  playlistTemplate = document.createElement("div");
  playlistTemplate.innerHTML = event.data;
  playlistTemplate = playlistTemplate.firstChild;

  showPlaylistList();
}

// Diese Klasse kapselt jegliche Operationen auf dem Playlist-Selection UI nach außen.
class PlaylistSelectionUiManager {

  constructor(playlistApiManager, playlistObserver, playlistHtmlManager,
    playlistStorageManager) {
    apiManager = playlistApiManager;
    observer = playlistObserver;
    htmlManager = playlistHtmlManager;
    storageManager = playlistStorageManager;
  }

  setListeners() {
    observer.addEventListener(Config.PLAYLIST_SELECTION_EVENT_KEY, init);
    observer.addEventListener(Config.END_SWIPE_BUTTON_CLICKED, startPlaylistSelection);
    observer.addEventListener(Config.PLAYLIST_READY_EVENT, playlistCreated);
    observer.addEventListener(Config.PLAYLIST_SELECTION_SONG_TEMPLATE_READY_EVENT, songTemplateLoaded);
    observer.addEventListener(Config.PLAYLIST_SELECTION_PLAYLIST_TEMPLATE_READY_EVENT, playlistTemplateLoaded);
  }
}

export default PlaylistSelectionUiManager;