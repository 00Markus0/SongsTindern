/* eslint-env browser */
import Config from "../utils/Config.js";
import {SongDetailsChangedEvent, SkipAmountChangedEvent, RejectSongEvent, GameModeChangedEvent, SongSwipedEvent} from "../utils/HelperEvents.js";
import Countdown from "../utils/Countdown.js";
import Toast from "../ui/Toast.js";

// In dieser Datei werden die Spielmodi betreffende Funktionalitäten implementiert.

// Variablen für den GameManager. Er speichert die Instanzen von observer und Countdown, einen Timeout in dem die Buttons 
//nicht verwendet werden können und einen boolean der während dieser Zeit true ist und hält den zurzeit gespielten GameMode.
var observer, countdown, timeout,
    areDisabled = false,
    gameMode;

// Diese Funktion wird immer aufgerufen, wenn ein neuer GameMode initalisiert wird.
function initGameModes() {
    let detailsEvent = new SongDetailsChangedEvent(true),
        skipEvent = new SkipAmountChangedEvent(Config.DEFAULT_SONG_SKIPS_AMOUNT),
        modeEvent = new GameModeChangedEvent(gameMode);

    // Normal Mode - 3x skippen, alle Details anzeigen.
    if(gameMode === Config.NORMAL_MODE_KEY) {
        observer.notifyAll(detailsEvent);
        observer.notifyAll(skipEvent);
        observer.notifyAll(modeEvent);
        countdown.setSpeedRoundType("");
    } 
    // Hidden Mode - 3x skippen, keine Details und Countdown (25 sek).
    else if(gameMode === Config.HIDDEN_MODE_KEY) {
        detailsEvent = new SongDetailsChangedEvent(false);
        observer.notifyAll(detailsEvent);
        observer.notifyAll(modeEvent);
        observer.notifyAll(skipEvent);
        countdown.setSpeedRoundType(Config.SPEED_ROUND_TYPE_HIDDEN_KEY);
    } 
    // Random Mode - 3x skippen, alle Details und randomly Countdown (8 sek).
    else if(gameMode === Config.RANDOM_MODE_KEY) {
        observer.notifyAll(detailsEvent);
        observer.notifyAll(skipEvent);
        observer.notifyAll(modeEvent);
        countdown.setSpeedRoundType(Config.SPEED_ROUND_TYPE_RANDOM_KEY);
    } 
    // Hard Mode - kein skippen, alle Details und Countdown (7 sek).
    else if(gameMode === Config.HARD_MODE_KEY) {
        skipEvent = new SkipAmountChangedEvent(0);
        observer.notifyAll(detailsEvent);
        observer.notifyAll(skipEvent);
        observer.notifyAll(modeEvent);
        countdown.setSpeedRoundType(Config.SPEED_ROUND_TYPE_HARD_KEY);
    }
}

// Diese Funktion gibt an den SwipeUIManager weiter, wenn der Countdown aus ist, also der Song gedislikt werden soll.
// Im SwipeUiManager kann dann die Karte auf der der Song zu sehen ist bewegt werden.
function countdownUp() {
    observer.notifyAll(new RejectSongEvent());
}

// Setzt den Countdown zurück
function resetCountdown() {
    countdown.resetTime();
}

// Ruft countdownTick auf (wird nur benötigt, wenn der Countdown gestartet werden soll).
function callCountdownTick() {
    countdown.countdownTick();
}

// Schaltet die Entscheidungsfunktionalität aus.
function freezeDecisionButton() {
    areDisabled = true;
}

// Schaltet die Entscheidungsfunktionalität ein und löscht den Timeout.
function reactivateDecisionButtons() {
    areDisabled = false;
    clearTimeout(timeout);
}

// Funktion wird aufgerufen wenn ein Song geswiped wird
function songSwipe() {
    // Der Countdown wird zurückgesetzt.
    observer.notifyAll(new SongSwipedEvent());

    // Die Entscheidungs-Funktionalität wird kurz eingefroren.
    freezeDecisionButton();
    timeout = setTimeout(reactivateDecisionButtons, Config.LIKE_TIMEOUT);
}

class GameManager {

    constructor(givenObserver) {
        observer = givenObserver;

        gameMode = "";

        countdown = new Countdown(observer);
        observer.addEventListener(Config.COUNTDOWN_UP_KEY, countdownUp);
        observer.addEventListener(Config.COUNTDOWN_RESET_KEY, resetCountdown);
        observer.addEventListener(Config.EVENT_SONG_PLAYING_KEY, callCountdownTick);
    }

    // Setzt den GameMode auf den übergebenen GameMode.
    setGameMode(mode) {
        gameMode = mode;
        initGameModes();
    }

    // Alle Funktionen die aufgerufen werden sollen, wenn ein Song geliked wird, werden hier dem Observer erstmalig 
    // bekannt gemacht und können dann über einen einzelnen Methodenaufruf an den Observer gleichzeitig ausgeführt werden.
    initLikeListeners(increaseMethod, updateMethod, storageManager, newCardMethod, playMethod) {
        observer.addEventListener(Config.LIKE_EVENT, increaseMethod);
        observer.addEventListener(Config.LIKE_EVENT, updateMethod);
        observer.addEventListener(Config.LIKE_EVENT, storageManager.addToCurrentSessionLikedSongs);
        observer.addEventListener(Config.LIKE_EVENT, storageManager.addToCurrentRoundLikedSongs);
        observer.addEventListener(Config.LIKE_EVENT, storageManager.updateGenreList);
        observer.addEventListener(Config.LIKE_EVENT, storageManager.addSongToSwiped);
        observer.addEventListener(Config.LIKE_EVENT, storageManager.increaseSongCount);
        observer.addEventListener(Config.LIKE_EVENT, storageManager.increaseLikeCounter);
        observer.addEventListener(Config.LIKE_EVENT, Toast.sendLikedToast);
        observer.addEventListener(Config.LIKE_EVENT, songSwipe);
        observer.addEventListener(Config.LIKE_EVENT, newCardMethod);
        observer.addEventListener(Config.LIKE_EVENT, playMethod);
    }

    // Alle Funktionen die aufgerufen werden sollen, wenn ein Song gedisliked wird, werden hier dem Observer erstmalig 
    // bekannt gemacht und können dann über einen einzelnen Methodenaufruf an den Observer gleichzeitig ausgeführt werden.
    initDislikeListeners(increaseMethod, storageManager, newCardMethod, playMethod) {
        observer.addEventListener(Config.DISLIKE_EVENT, increaseMethod);
        observer.addEventListener(Config.DISLIKE_EVENT, storageManager.increaseDislikeCounter);
        observer.addEventListener(Config.DISLIKE_EVENT, storageManager.increaseGenreSwipesLeft);
        observer.addEventListener(Config.DISLIKE_EVENT, songSwipe);
        observer.addEventListener(Config.DISLIKE_EVENT, newCardMethod);
        observer.addEventListener(Config.DISLIKE_EVENT, playMethod);
    }

    // Erlaubt den Zugriff auf die Information, ob die Entscheidungsfunktionalität gerade aktiv oder nicht aktiv ist.
    get disabled() {
        return areDisabled;
    }
}

export default GameManager;