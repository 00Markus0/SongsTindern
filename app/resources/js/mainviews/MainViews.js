/* eslint-env browser */
/* eslint no-undef: 0 */ // no-undef Error at new Spotify even though Spotify is defined through library
/* eslint-disable camelcase */ // Schreibweise von Spotify API vorgegeben
import { Observer, Event } from "../utils/Observer.js";
import { PlayerIsPlayingSongEvent } from "../utils/HelperEvents.js";
import ApiManager from "../api/ApiManager.js";
import Config from "../utils/Config.js";
import UiManager from "../ui/UiManager.js";
import StorageManager from "../storage/StorageManager.js";
import HtmlManager from "../ui/HtmlManager.js";
import Toast from "../ui/Toast.js";

var player, // Ein Spotify.Player-Objekt, um Songs direkt im Browser abspielen zu können.
  observer, // Observer-Objekt zur Kommunikation mit der restlichen Anwendung.
  apiManager, // Ein ApiManager-Objekt, dass die Kommunikation mit der Spotify-API kapselt
  storageManager, // Ein StorageManager-Objekt das laden und speichern im Anwendungsspeicher erlaubt.
  uiManager, // Ein UiManager-Objekt, dass den Wechsel der Ansichten erlaubt.
  htmlManager, //Ein HTMLManager-Objekt, dass den HTML code für die jeweilige Ansicht lädt
  playerReady = false, // Information darüber, ob der Spotify-Player richtig initialisiert wurde.
  startViewReady = false, // Information darüber, ob der Startbildschirm vom Server geladen und angezeigt werden konnte.
  device, // Die mit dem Player assoziierte Id.
  songLoaded = false; // Information darüber, ob der Song der gerade abgespielt werden soll schon abspielfertig ist.

// Initalisierung der Objekte
function init() {
  observer = new Observer();
  htmlManager = new HtmlManager(observer);
  htmlManager.changeToStartScreen();
  htmlManager.addIconbar();
  observer.addEventListener(Config.CHANGED_TO_START_VIEW, startViewCalled);
  storageManager = new StorageManager();
  apiManager = new ApiManager(observer, storageManager);

  // Wird das Fenster geschlossen oder neugeladen während eine Runde läuft wird der Spielstand gespeichert.
  window.addEventListener("unload", function() {
    if(storageManager.getGameRunning()) {
      storageManager.saveGameState();
    }
  });

  // Startet die Initialisierung des Spotify-Players.
  initWebplayer();
}

// Diese Funktion wird aufgerufen, wenn der Startbildschirm aus der entsprechenden HTML-Datei geladen wurde.
function startViewCalled() {
  if (uiManager === undefined) {
    uiManager = new UiManager(player, observer, apiManager, storageManager, htmlManager);
  }
  startViewReady = true;
  // Dann können die Buttons initialisiert werden.
  uiManager.initStartButton();
  readyToRumble();
}

// Diese Funktion überprüft, ob Startbildschirm und Player fertig geladen wurden, dann kann das Spiel gestartet werden.
function readyToRumble() {
  var event;
  if (playerReady && startViewReady) {
    event = new Event(Config.PLAYER_READY_CALLBACK_KEY, device);
    observer.notifyAll(event);
  }
}

// Diese Funktion registriert einen Player bei Spotify, der dann ein neues virtuelles Gerät darstellt, über das Songs 
// direkt im Browser abgespielt werden können.
function initWebplayer() {
  window.onSpotifyWebPlaybackSDKReady = () => {
    // Falls der AccessToken im Speicher schon abgelaufen ist, wird erst ein neuer Token erzeugt und dann der Player initialisert.
    let currentTime = new Date();
    currentTime = currentTime.getTime();
    if(currentTime >= storageManager.lifeTimeToken) {
      apiManager.refreshAuthToken();
    }
    initPlayer();
  };
}

// Falls dieser Fehler auftritt wird ein Button angezeigt, der erst geklickt werden muss, bevor geswiped werden kann.
// Ein Klick auf den Button (oder eine Benutzung der Pfeiltasten) ist eine Interaktion mit der Website also wird dadurch Autoplay aktiviert.
function handleAutoplayError() {
  let button = document.createElement("button"),
    background = document.createElement("div");

  button.innerHTML = "Click here to resume round";
  button.classList.add("errorButton");
  background.classList.add("error-background");

  button.addEventListener("click", function() {
    button.classList.add("hidden");
    background.classList.add("hidden");
    player.resume();
  });

  document.addEventListener("keyup", function(event) {
    if(event.key === Config.ARROW_LEFT_KEY || event.key === Config.ARROW_RIGHT_KEY) {
      button.classList.add("hidden");
      background.classList.add("hidden");
    }
  });

  document.querySelector("body").appendChild(background);
  document.querySelector("body").appendChild(button);
}

// Entsprechend der SDK-Referenz wird ein neues Gerät mit dem Namen Songs Tindern registriert
function initPlayer() {
  const token = storageManager.accessToken;
  player = new Spotify.Player({
    name: "SongsTindern",
    getOAuthToken: cb => { cb(token); },
  });

  // Error handling über Listener, geben Toast-Messages an den Nutzer aus.
  player.addListener("initialization_error", () => {
    Toast.initErrorToast();
  });

  // Authentification Error
  player.addListener("authentication_error", (event) => {
    if(event.message === Config.LACK_OF_INTERACTION_ERROR) {
      // Interessanterweise liefert ein fehlerhaftes Autoplay (Autoplay ist nur möglich, wenn schon auf die Website geklickt wurde) einen Auth-Error
      handleAutoplayError();
    } else {
      apiManager.refreshAuthToken();
    }
  });

  // Account Error
  player.addListener("account_error", () => {
    Toast.premiumNeededToast();
  });

  // Playback Error
  player.addListener("playback_error", () => {
    /// Platzhalter falls zukünftig reaktionen darauf erforderlich werden sollten.
  });

  // Player state change überprüft das Abspielen eines Songs vom Player,
  // lädt die Songs-Länge und stoppt das Abspielen eines Songs für den Fall, dass er pausiert sein soll.
  player.addListener("player_state_changed", (event) => {
    if (event !== undefined && event !== null) {
      if (event["loading"] === true) {
        songLoaded = false;
      }

      // Falls der Song weiterläuft, obwohl im Speicher steht, dass er pausiert sein sollte wird der Player explizit pausiert.
    if (storageManager.paused === true) {
      player.pause();
    }
    else {
      // Der Observer wird darüber informiert, dass gerade ein Song läuft.
      if (!songLoaded && event !== undefined && event["loading"] === false) {
        observer.notifyAll(new PlayerIsPlayingSongEvent());
        songLoaded = true;
      }
    }
    }
  });

  // Wenn der Player asynchron fertig registriert ist wird die Device ID im LocalStorage abgelegt
  player.addListener("ready", ({ device_id }) => { 
    playerReady = true;
    device = device_id;
    readyToRumble();
  });

  // Falls das Gerät offline geht wird ein Toast ausgegeben.
  player.addListener("not_ready", () => {
    Toast.deviceOfflineToast();
  });

  // Der Player wird asynchron angefragt und bei Spotify als Gerät registriert.
  player.connect();
}

init();