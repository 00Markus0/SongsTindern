/* eslint-env browser */
import Config from "../utils/Config.js";
import { getWidth, shorten } from "../utils/HelperFunctions.js";
import GameManager from "../game/GameManager.js";
import { hammerFunction, getRandomNumber } from "../utils/HelperFunctions.js";
import { SwipingEndEvent, SongLikeEvent, SongDislikeEvent } from "../utils/HelperEvents.js";
import Toast from "./Toast.js";

var tinderContainer, allCards, reject, accept, btnEndPlaylist, iconBarHeader, allCardsList, // Die DOM-Elemente.
  rejectListener, acceptListener, // Lsitener-Funktionen
  observer, storageManager, songManager, gameManager, player, currentCard, htmlManager, apiManager,// Die Objekte
  isRandomMode, isHardMode, audioLoaded = false, // Booleans zur Beschreibung des aktuellen Zustands.
  template, // Das Template für Tinderkarten.
  addedCardsList = [],
  cardChildCounter = 0,
  swipesCounter = 0,
  songSkipsCounter = 0,
  playerIsReady = false,
  sessionStarted = false,
  inSwipeView = false,
  showSongDetails = true,
  doShowTitle = true,
  doShowInterpret = true,
  doShowCover = true;

// Pausiert das Abspielen und setzt den Zustand im Localstorage auf pausiert.
function pausePlayback() {
  storageManager.setPaused();
  player.pause();
}

// Startet den Swipebildschirm indem die entsprechende HTML-Datei geladen wird.
function startSwiping() {
  htmlManager.changeToSwipeScreen();
  storageManager.setGameRunning();
}

// Wechselt zum Playlistauswahlbildschirm, indem die entsprechende HTML-Datei geladen wird und der Keylistener wieder entfernt wird.
function endPlaylistClicked() {
  allCardsList = document.querySelectorAll(".tinder--card:not(.removed)");
  pausePlayback();
  observer.notifyAll(new SwipingEndEvent());
  iconBarHeader.innerHTML = "Songs Tindern";
  removeArrowKeyListener();
  observer.notifyAll(new Event(Config.END_SWIPE_BUTTON_CLICKED, null));
  isRandomMode = false;
  isHardMode = false;
  inSwipeView = false;
}

// Wird der Startbutton geklickt, wechselt man auf den entsprechenden Bildschirm.
function startButtonClicked(mode) {
  gameManager.setGameMode(mode);
  observer.notifyAll(new Event(Config.TOGGLE_ICON_BAR_EVENT, null));
  // Abhängig von der Bildschirmbreite wird der Headertext unterschiedlich ausführlich gesetzt.
  if (getWidth() > Config.MIN_WIDTH_DISPLAYING_INFOS) {
    iconBarHeader.innerHTML = "Swipe Right to add to Playlist";
  } else {
    iconBarHeader.innerHTML = "Right = Like";
  }

  if (playerIsReady) {
    startSwiping();
  }

  inSwipeView = true;

  // Das Abspielen wird gestartet und der Keylistener auf die Pfeiltasten registiert.
  addArrowKeyListener();
}

// Für jeden Gamemodebutton wird die entsprechende Funktionalität als Listener registriert.
function startButtonLoaded() {
  document.getElementById("normalModeBtn").addEventListener("click", function () {
    if (playerIsReady) {
      startButtonClicked(Config.NORMAL_MODE_KEY);
      storageManager.setGameodeNormal();
    }
  });
  document.getElementById("hiddenModeBtn").addEventListener("click", function () {
    if (playerIsReady) {
      startButtonClicked(Config.HIDDEN_MODE_KEY);
      storageManager.setGamemodeHidden();
    }
  });
  document.getElementById("randomModeBtn").addEventListener("click", function () {
    if (playerIsReady) {
      startButtonClicked(Config.RANDOM_MODE_KEY);
      storageManager.setGamemodeRandom();
    }
  });
  document.getElementById("hardModeBtn").addEventListener("click", function () {
    if (playerIsReady) {
      startButtonClicked(Config.HARD_MODE_KEY);
      storageManager.setGamemodeHard();
    }
  });
}

// Initialisiert die Buttons zum start der Playlist, zum Wechseln zum Swipescreen und die Dislike und Likebuttons.
// Beim Wechseln in den Swipescreen werden die ersten Karten erstellt.
function initButtons() {
  tinderContainer = document.querySelector(".tinder");
  allCards = document.querySelectorAll(".tinder--card");
  reject = document.querySelector(".dislikeButton");
  accept = document.querySelector(".likeButton");
  btnEndPlaylist = document.querySelector(".buttonEndPlaylist");

  rejectListener = createButtonListener(false);
  acceptListener = createButtonListener(true);

  // Beim Klicken auf den End-Playlist button wird die musik angehalten und die momentane Playlist beendet
  btnEndPlaylist.addEventListener("click", endPlaylistClicked);
  reject.addEventListener("click", rejectListener);
  accept.addEventListener("click", acceptListener);

  // Das Template für die Tinderkarten wird per fetch aus der entsprechenden HTML Datei geladen.
  htmlManager.getTinderCardTemplate();

  if(storageManager.gamemode === "Hard") {
    Toast.sendHardmodeSkipToast();
  } else {
    Toast.sendSwipeToast(); 
  }
}

// Erstellen der ersten 3 Karten im UI.
function startSwipeMethod() {
  initFirstCards();
  initFirstCards();
  createNewCard();
}

// Diese Methode ist für die ersten zwei Cards gedacht und fügt diese dem HTML-DOM hinzu, 
// damit immer 3 Karten im UI angezeigt werden, was für die Swipeanimation nötig ist.
function initFirstCards() {
  let newSongCardTemplate = template.cloneNode(true),
    cardsList = document.getElementById("tinder-cards-list"),
    newSongCardTemplateContent = newSongCardTemplate.content;
  songManager.getNewSong();

  cardsList.appendChild(newSongCardTemplateContent);
  addedCardsList.push(newSongCardTemplateContent);

  allCards = document.querySelectorAll(".tinder--card");
}

//Diese Funktion löscht eine übergebene Karte aus dem DOM.
function deleteCard(card) {
  let newCards = document.querySelectorAll(".tinder--card:not(.removed)");

  //Der Timeout wird benötigt, damit die Karte nicht gelöscht wird, bevor die Animation abgespielt wurde
  setTimeout(function () {
    if (newCards.length >= Config.MAX_NUMBER_CARDS) {
      card.remove();
      updateCurrentCard();
    }
  }, Config.TIMEOUT);
}

// Diese Funktion erstellt eine neue Karte und fügt diese dem HTML hinzu.
// Die hier aufgerufene Hammerfunction initialisiert die Swipefunktion für diese.
function createNewCard() {
  let newSongCardTemplate = template.cloneNode(true),
    cardsList = document.getElementById("tinder-cards-list"),
    newSongCardTemplateContent = newSongCardTemplate.content,
    hammerTimeout;

  // Song Skips werden zurückgesetzt, bei randomMode wird direkt zu einer random Stelle gesprungen
  if (!isHardMode) {
    songSkipsCounter = Config.DEFAULT_SONG_SKIPS_AMOUNT;
  }

  songManager.getNewSong();
  cardsList.appendChild(newSongCardTemplateContent);
  addedCardsList.push(newSongCardTemplateContent);
  initCards();
  
  // Um zu viele API Anfragen durch zu schnelles Swipen zu verhindern wird die Swipe-Funktionalität erst nach einem Timeout der Karte hinzugefügt.
  hammerTimeout = setTimeout(function() {
    hammerize(dislike, like, deleteCard, hammerTimeout);
  }, Config.LIKE_TIMEOUT);
}

// Diese Funktion fügt der Karte die Swipe-Funktionalität hinzu und löscht das vorherige Timeout
function hammerize(dislike, like, deleteCard, timeout) {
  if(inSwipeView) {
    hammerFunction(dislike, like, deleteCard);
  }
  clearTimeout(timeout);
}

//Abspielen des nächsten Songs.
function playNextSong() {
  songManager.playSongWithId(swipesCounter);
}

// Diese Methode initialisiert/updatet die Karten-Ansicht.
// Dazu werden alle (sichtbaren) Karten erst zwischengespeichert und dann über jede Karte iteriert. Hintere Karten werden damit kleiner angezeigt.
// Zuletzt wird den Karten die Klasse loaded hinugefügt.
function initCards() {
  var newCards = document.querySelectorAll(".tinder--card:not(.removed)");

  newCards.forEach(function (card, index) {
    card.style.zIndex = allCards.length - index;
    card.style.transform = "scale(" + (Config.TRANSFORM_VALUE - index) / Config.TRANSFORM_VALUE + ")";
  });

  tinderContainer.classList.add("loaded");
}

// Der Karte wird ein Song hinzugefügt, die UI-Elemente der Karte werden mit den entsprechenden Daten gesetzt.
// Der Song der ersten Karte wird abgespielt.
function setSongToCard(event) {
  let cardsList = document.getElementById("tinder-cards-list"),
      titleOfSong = event.data.title,
      interpretOfSong = event.data.artist;
    
  if (cardsList !== null && cardsList !== undefined) {
    cardsList = cardsList.lastElementChild;
  }

  if (cardChildCounter < Config.MAX_CHILD_CARD_COUNTER) {
    cardsList = document.getElementById("tinder-cards-list").children[cardChildCounter];
    cardChildCounter++;
  }
  if (cardChildCounter === 1) {
    songManager.playSongWithId(0);
  }

  // Der Titel und Interpret werden (u.U.) auf eine passable Länge gekürzt.
  titleOfSong = shorten(titleOfSong, Config.MAX_CARD_TITLE_LENGTH);
  interpretOfSong = shorten(interpretOfSong, Config.MAX_CARD_INTERPRET_LENGTH);

  saveSongDetailsInCard(cardsList, titleOfSong, interpretOfSong, event);
  setSongDetailsOfCard(cardsList, titleOfSong, interpretOfSong, event);
}

// Der Titel und Interpret wird in der Karte gespeichert.
function saveSongDetailsInCard(cardsList, titleOfSong, interpretOfSong, event){
  if(cardsList !== null && cardsList !== undefined) {
    cardsList.children["hiddenTitle"].innerHTML = titleOfSong;
    cardsList.children["hiddenInterpret"].innerHTML = interpretOfSong;
    cardsList.children["hiddenCover"].src = event.data.coverImage;
  }
}

// Je nachdem, ob die SongDetails angezeigt werden sollen, werden diese Attribute der Karte gesetzt.
function setSongDetailsOfCard(cardsList, titleOfSong, interpretOfSong, event){
  if (showSongDetails) {
    if (doShowTitle) {
      cardsList.children["songTitle"].innerHTML = titleOfSong;
    }
    if (doShowInterpret) {
      cardsList.children["songInterpret"].innerHTML = interpretOfSong;
    }
    if (doShowCover) {
      cardsList.children["cover"].src = event.data.coverImage;
    }
  } else {
    cardsList.children["songTitle"].innerHTML = "";
    cardsList.children["songInterpret"].innerHTML = "";
    cardsList.children["cover"].src = Config.DEFAULT_SONG_COVER_PATH;
  }
}

// Der Listener auf die Pfeiltasten wird gesetzt, wenn der Start Button gedrückt wird ...
function addArrowKeyListener() {
  document.addEventListener("keydown", checkArrowKeys);
}

// ... und entfernt, wenn man die Ansicht wechselt oder auf End Playlist drückt.
function removeArrowKeyListener() {
  document.removeEventListener("keydown", checkArrowKeys);
}

// Falls die Pfeiltasten gedrückt werden wird der Song geliket oder gedisliket.
function checkArrowKeys(event) {
  // Es wird überprüft, ob die Like-Funktionalität sich gerade im Cooldown befindet, um duch spammen der Pfeiltasten keine API-Fehler zu erzeugen.
  if(gameManager.disabled === false) {
    if (event.key === Config.ARROW_RIGHT_KEY) {
      let evLike = createButtonListener(true);
      evLike();
    }
    if (event.key === Config.ARROW_LEFT_KEY) {
      let evDislike = createButtonListener(false);
      evDislike();
    }
  }
}

// Ändert beim Gamemodewechsel die zur Verfügung stehende Zahl an Skips.
function changeSkipAmount(event) {
  songSkipsCounter = event.data;
}

// Ändert beim Wechsel des Gamemodes, ob die Deatils zum Song angezeigt werden sollen oder nicht.
function changeShowSongDetails(event) {
  if (event.data === true) {
    setSettingsToShowSongDetails();
  } else {
    setSettingsToHideSongDetails();
  }
}

// Die Variablen werden so gesetzt, dass die Songdetails (wieder) angezeigt werden.
function setSettingsToShowSongDetails(){
  showSongDetails = true;
  doShowTitle = true;
  doShowInterpret = true;
  doShowCover = true;
  updateSongDetail(true, Config.SONG_TITLE_KEY);
  updateSongDetail(true, Config.SONG_INTERPRET_KEY);
  updateSongDetail(true, Config.SONG_COVER_KEY);
}

// Die Variablen werden so gesetzt, dass die Songdetails nicht mehr angezeigt werden.
function setSettingsToHideSongDetails(){
  showSongDetails = false;
  doShowTitle = false;
  doShowInterpret = false;
  doShowCover = false;
  updateSongDetail(false, Config.SONG_TITLE_KEY);
  updateSongDetail(false, Config.SONG_INTERPRET_KEY);
  updateSongDetail(false, Config.SONG_COVER_KEY);
}

//Diese Methode zeigt den Interpret, Titel oder Songcover bei den bereits geladenen Karten an (oder blendet diese aus).
// Wichtig bei Wechsel des Gamemodes.
function updateSongDetail(show, songDetail) {
  if (allCardsList !== null && allCardsList !== undefined && allCardsList.length !== 0) {
    for (let i = 0; i < allCardsList.length; i++) {
      let card = allCardsList[i];
      updateTitleData(show, songDetail, card);
      updateInterpretData(show, songDetail, card);
      updateCoverData(show, songDetail, card);
    }
  }
}

// Ändert die Anzeige des übergebenen Songs um den Titel (nicht mehr) zu verbergen.
function updateTitleData(show, songDetail, card){
  if (!show && songDetail === Config.SONG_TITLE_KEY) {
    card.children["songTitle"].innerHTML = "";
  } else if (show && songDetail === Config.SONG_TITLE_KEY){
    card.children["songTitle"].innerHTML = card.children["hiddenTitle"].innerHTML;
  }
}

// Ändert die Anzeige des übergebenen Songs, um den Interpreten (nicht mehr) zu verbergen.
function updateInterpretData(show, songDetail, card){
  if (!show && songDetail === Config.SONG_INTERPRET_KEY) {
    card.children["songInterpret"].innerHTML = "";
  } else if (show && songDetail === Config.SONG_INTERPRET_KEY){
    card.children["songInterpret"].innerHTML = card.children["hiddenInterpret"].innerHTML;
  }
}

// Ändert die Anzeige des übergebenen Songs, um das Cover (nicht mehr) zu verbergen.
function updateCoverData(show, songDetail, card){
  if (!show && songDetail === Config.SONG_COVER_KEY) {
    card.children["cover"].src = Config.DEFAULT_SONG_COVER_PATH;
  } else {
    card.children["cover"].src = card.children["hiddenCover"].src;
  }
}

// Aktualisiert das übergebene Song-Objekt in dem Swipezeit und Playlistname gesetzt werden, die Genreliste aktualisiert wird,
// der Song der Playlist hinzugefügt wird und die Details für den Song geladen werden.
function updateSongObj(event) {
  var curr = event.data;
  curr.setSwipeTime();
  songManager.getSongDetailsForSong(swipesCounter);
}

// Erhöht die Zahl der gelikten Songs.
function increaseCounter() {
  swipesCounter++;
}

// Initialisiert über den Gamemanager, die Funktionen, die bei einem Like oder Dislike ausgeführt werden.
function initLikeDislikeListeners() {
  gameManager.initLikeListeners(increaseCounter, updateSongObj, storageManager, createNewCard, playNextSong);
  gameManager.initDislikeListeners(increaseCounter, storageManager, createNewCard, playNextSong);
}

// Diese Funktion liket einen Song indem ein entsprechendes Objekt dem Observer übergeben wird.
function like() {
  if (playerIsReady) {
    // Der aktuelle Song wird in curr gespeichert
    let curr = songManager.getSongwithId(swipesCounter),
      event = new SongLikeEvent(curr);
    
    observer.notifyAll(event);
  }
}

// Diese Funktion dislikt einen Song indem ein entsprechendes Objekt dem Observer übergeben wird.
function dislike() {
  var curr, event;
  if (playerIsReady) {

    curr = songManager.getSongwithId(swipesCounter+1);
    event = new SongDislikeEvent(curr);
    observer.notifyAll(event);
  }
}

// Diese Funktion wird aufgerufen, wenn der Webplayer bereit ist, dann wird die device_id gespeichert und der Button "scharfgestellt".
function playerReadyCallback(event) {
  var deviceId = event.data;
  storageManager.setDeviceID(deviceId);

  if(document.getElementById("normalModeBtn") !== null) {
    document.getElementById("normalModeBtn").classList.add("gameModeBtnsReady");
    document.getElementById("hiddenModeBtn").classList.add("gameModeBtnsReady");
    document.getElementById("randomModeBtn").classList.add("gameModeBtnsReady");
    document.getElementById("hardModeBtn").classList.add("gameModeBtnsReady");
  }  

  playerIsReady = true;

  if(storageManager.getGameRunning()) {
    startSwipeWithGameMode();
  } else {
    Toast.sendWelcomeToast();
  }
}

// Startet das Swipen und setzt den Gamemode.
function startSwipeWithGameMode(){
  let gameMode = storageManager.gamestate.gameMode,
      likedSongs = storageManager.gamestate.likedSongs;
    
  storageManager.currentLikes = likedSongs;

  switch (gameMode) {
    case "Normal":
      startButtonClicked(Config.NORMAL_MODE_KEY);
      break;
    case "Hard":
      startButtonClicked(Config.HARD_MODE_KEY);
      break;
    case "Hidden":
      startButtonClicked(Config.HIDDEN_MODE_KEY);
      break;
    case "Random":
      startButtonClicked(Config.RANDOM_MODE_KEY);
      break;
    default:
      startButtonClicked(Config.NORMAL_MODE_KEY);
  }
}

// Für jede Karte wird ein Listener registiert, der zufällig im Song skippt, wenn die Karte doppelt geklickt wird.
function setDoubleClickListener() {
  currentCard.addEventListener("dblclick", seekPositionWithDblClick);
}

// Der Doppelklick-Listener, wird auf die nächste aktive Karte "verschoben".
function updateCurrentCard() {
  if(currentCard !== undefined) {
    currentCard.removeEventListener("dblclick", seekPositionWithDblClick);
  }
  currentCard = document.querySelector(".tinder--card:not(.removed)");
  setDoubleClickListener();
}

// Diese Funktion wird aufgerufen, wenn das Template geladen wurde, dann wird das Template in der template Variablen abgelegt und die ersten Karten werden erzeugt.
function templateReady(event) {
  template = document.createElement("div");
  template.innerHTML = event.data;
  template = template.firstChild;

  if (!sessionStarted) {
    startSwipeMethod();
    sessionStarted = true;
  } else {
    songManager.playSongWithId(swipesCounter);
    let cardsList = document.getElementById("tinder-cards-list");

    for (let i = 0; i < allCardsList.length; i++) {
      cardsList.appendChild(allCardsList[i]);
    }
  }

  if (currentCard === undefined) {
    updateCurrentCard();
  }
}

 // Buttonlistener für den like und dislike button und löschen der Karte aus dem UI werden hier erzeugt.
 function createButtonListener(likeType) {
  return function (event) {
    // Falls das Spiel läuft.
    if (!gameManager.disabled) {
      // Die oberste Karte wird selektiert.
      let cards = document.querySelectorAll(".tinder--card:not(.removed)"),
        card = cards[0],
        // Es wird berechnet, wo die Karte außerhalb des Bildschirms liegt.
        moveOutWidth = document.body.clientWidth * Config.WIDTH_MULTIPLY_VALUE;

      if (!cards.length) {return false;}
      // Die Karte wird entfernt.
      card.classList.add("removed");

      //Je nachdem auf welchen Button man geklickt hat wird die Karte animiert und über den Bildschirmrand nach links oder rechts bewegt und die entsprechende Methode ausgeführt
      if (likeType) {
        card.style.transform = "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
        like();
        deleteCard(card);
      } else {
        card.style.transform = "translate(-" + moveOutWidth + "px, -100px) rotate(30deg)";
        dislike();
        deleteCard(card);
      }
      if(event !== null && event !== undefined) {
        event.preventDefault();
      }
    }
    return null;
  };
}

// Diese Funktion skippt im aktuellen Song an eine zufällige Stelle. Dabei sind aber nur eine festgelegte Zahl an Skips möglich.
function seekPosition(showToast) {
  //Auslesen der Länge des Songs, berechnen einer random Zeit für den Song
  let currSong = songManager.getSongwithId(swipesCounter),
    length = currSong.length,
    randomNumber = getRandomNumber(Config.FIVE_SECONDS_IN_MILLISECONDS, length - Config.TWENTY_SECONDS_IN_MILLISECONDS);

  //Skippen an eine random Stelle
  if(randomNumber > 0) {
    apiManager.seekToPos(randomNumber);
    if(showToast) {
      Toast.sendSkipToast(songSkipsCounter);
    }
  } 
}

// Diese Funktion wird aufgerufen, wenn der Benutzer doppelt auf den Song klickt, um zu einer zufälligen Position zu springen.
function seekPositionWithDblClick() {
  if(storageManager.gamemode === "Hard") {
    Toast.sendHardmodeSkipToast();
    return;
  }

  if (songSkipsCounter > 0) {
    seekPosition(true);
    songSkipsCounter--;
  } else {
    //Wenn der Nutzer keine Skips mehr übrig hat, dann wird ihm das in einem Toast.
    Toast.sendSkipToast(songSkipsCounter);
  }
}

// Diese Funktion wird aufgerufen, wenn ein Song gedisliked wird. Notwendig für Übergabe an Observer.
function rejectSong() {
  rejectListener();
}

// Setzt den Systemzustand entsprechend des gewählten Gamemodes.
function changeGameMode(roundType) {
  if (roundType.data === Config.RANDOM_MODE_KEY) {
    isHardMode = false;
    isRandomMode = true;
  } else if (roundType.data === Config.HARD_MODE_KEY) {
    isRandomMode = false;
    isHardMode = true;
  } else {
    isRandomMode = false;
    isHardMode = false;
  }
}

// In der random und hart Runde wird mit dieser Funktion zufällig im Song gesprungen.
function skipAutomatically() {
  if(audioLoaded) {
    if (isRandomMode || isHardMode) {
      let currSong = songManager.getSongwithId(swipesCounter),
        length = currSong.length,
        randomNumber = getRandomNumber(Config.FIVE_SECONDS_IN_MILLISECONDS, length - Config.TWENTY_SECONDS_IN_MILLISECONDS);
  
      apiManager.seekToPos(randomNumber);
    }
  }
}

function setAudioLoaded() {
  audioLoaded = true;
  skipAutomatically();
}

function initListeners() {
  //Listener zum Setzen der Karten mit random songs
  observer.addEventListener(Config.SONG_SHOWABLE_EVENT, setSongToCard);
  observer.addEventListener(Config.PLAYER_READY_CALLBACK_KEY, playerReadyCallback);
  observer.addEventListener(Config.TINDER_CARD_TEMPLATE_READY, templateReady);

  //GameManager-Klasse referenzieren und ein observer erstellen, der darauf hört, wenn z.b. der Countdown aus ist.
  observer.addEventListener(Config.SKIP_AMOUNT_CHANGED_KEY, changeSkipAmount);
  observer.addEventListener(Config.SONG_DETAILS_SHOW_CHANGED_KEY, changeShowSongDetails);
  observer.addEventListener(Config.EVENT_SPEED_MODE_SETTING_KEY, changeGameMode);
  observer.addEventListener(Config.REJECT_SONG_KEY, rejectSong);
  observer.addEventListener(Config.EVENT_SONG_AUDIO_LOADED_KEY, setAudioLoaded);
  observer.addEventListener(Config.EVENT_SONG_PLAYING_KEY, resumePlayer);

  initLikeDislikeListeners();
}

function resumePlayer() {
  player.resume().then(() => {
    if (playerIsReady) {
      storageManager.setResumed();
    }
  });
}

// Der SwipeUiManager kapselt Verändeurngen des Startbildschirms und des Swipe-Uis nach außen.
class SwipeUiManager {
  constructor(swipeObserver, swipeStorageManager, swipeSongManager, swipePlayer, swipeHtmlManager, swipeApiManager, iconBar) {
    observer = swipeObserver;
    storageManager = swipeStorageManager;
    songManager = swipeSongManager;
    player = swipePlayer;
    htmlManager = swipeHtmlManager;
    iconBarHeader = iconBar;
    apiManager = swipeApiManager;

    isRandomMode = false;
    isHardMode = false;

    gameManager = new GameManager(observer);

    initListeners();
  }
  
  initStartButton() {
    startButtonLoaded();
  }

  init() {
    observer.addEventListener(Config.CHANGED_TO_SWIPE_VIEW, initButtons);
  }

  set sessionStarted(started) {
    sessionStarted = started;
  }
}

export default SwipeUiManager;