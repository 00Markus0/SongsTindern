/* eslint-env browser */
import SongManager from "../song/SongManager.js";
import Config from "../utils/Config.js";
import SwipeUiManager from "./SwipeUiManager.js";
import HistoryUIManager from "./HistoryUiManager.js";
import StatisticsUIManager from "./StatisticsUiManager.js";
import PlaylistSelectionUiManager from "./PlaylistSelectionUiManager.js";

var player, swipeUiManager, observer, htmlManager, apiManager, storageManager, historyUiManager, statisticsUiManager, playlistUiManager,
  songManager, swipeViewBtn, historyViewBtn, statisticsViewBtn, iconBarHeader;

// Wechselt auf den Swipe Screen (bzw. Startbildschirm) indem die entsprechende HTML-Datei mit fetch geladen wird.
function changeToSwipeView() {
  player.pause();
  htmlManager.changeToStartScreen();

  swipeViewBtn.classList.add("active");
  historyViewBtn.classList.remove("active");
  statisticsViewBtn.classList.remove("active");

  iconBarHeader.innerHTML = "Songs Tindern";
}

// Pausiert das Abspielen und markiert den Zustand im Localstorage als pausiert.
function pausePlayback() {
  storageManager.setPaused();
  player.pause();
}

// Wechselt zum History Screen indem die entsprechende HTML-Datei mit fetch geladen wird.
function changeToHistoryView() {
  pausePlayback();
  htmlManager.changeToHistoryScreen();

  iconBarHeader.innerHTML = "Swipe History";

  swipeViewBtn.classList.remove("active");
  historyViewBtn.classList.add("active");
  statisticsViewBtn.classList.remove("active");
}

// Wechselt zum Statistics Screen indem die entsprechende HTML-Datei mit fetch geladen wird.
function changeToStatisticsView() {
  swipeViewBtn.classList.remove("active");
  historyViewBtn.classList.remove("active");
  statisticsViewBtn.classList.add("active");

  pausePlayback();
  htmlManager.changeToStatisticsScreen();

  iconBarHeader.innerHTML = "Swipe Statistics";
}

// Initialisiert die Iconbar sobald diese asynchron geladen wurde und weist den Icons die Wechsel-Funktionen zu.
function initIconBarButtons() {
  swipeViewBtn = document.querySelector("#swipeBtn");
  historyViewBtn = document.querySelector("#historyBtn");
  statisticsViewBtn = document.querySelector("#statisticsBtn");

  swipeViewBtn.addEventListener("click", changeToSwipeView);
  historyViewBtn.addEventListener("click", changeToHistoryView);
  statisticsViewBtn.addEventListener("click", changeToStatisticsView);

  swipeViewBtn.classList.add("active");
}

function toggleIcons() {
  if (swipeViewBtn !== undefined) {
    if (swipeViewBtn.classList.contains("hidden")) {
      swipeViewBtn.classList.remove("hidden");
      historyViewBtn.classList.remove("hidden");
      statisticsViewBtn.classList.remove("hidden");
    } else {
      swipeViewBtn.classList.add("hidden");
      historyViewBtn.classList.add("hidden");
      statisticsViewBtn.classList.add("hidden");
    }
  }
}

// Der UIManager kapselt nach außen alle Operationen die auf den mainView-UIs ausgeführt werden.
class UiManager {
  constructor(mainViewPlayer, mainViewObserver, mainViewApiManager,
    mainViewStorageManager, mainViewHtmlManager) {
    player = mainViewPlayer;
    apiManager = mainViewApiManager;
    observer = mainViewObserver;
    storageManager = mainViewStorageManager;
    htmlManager = mainViewHtmlManager;

    iconBarHeader = document.querySelector(".barheader");
    songManager = new SongManager(apiManager, observer, storageManager);
    swipeUiManager = new SwipeUiManager(observer, storageManager, songManager, player, htmlManager, apiManager, iconBarHeader);
    historyUiManager = new HistoryUIManager(observer, apiManager, storageManager, songManager, player, htmlManager, iconBarHeader);
    statisticsUiManager = new StatisticsUIManager(observer, storageManager);
    playlistUiManager = new PlaylistSelectionUiManager(apiManager, observer, htmlManager, storageManager);

    historyUiManager.setListeners();
    statisticsUiManager.setListeners();
    playlistUiManager.setListeners();

    this.initSwipeView();

    // Die initIconBarButtons-Funktion wird über den Observer aufgerufen, sobald die Iconbar asynchron geladen wurde
    observer.addEventListener(Config.ADDED_ICON_BAR, initIconBarButtons);
    observer.addEventListener(Config.TOGGLE_ICON_BAR_EVENT, toggleIcons);
  }

  // initialisiert das Swipe UI
  initSwipeView() {
    swipeUiManager.init();
  }

  // initialisiert die Buttons zum start des song-tinderns über die GameMode buttons
  initStartButton() {
    swipeUiManager.initStartButton();
  }

  set sessionStarted(started) {
    swipeUiManager.sessionStarted = started;
  }

}

export default UiManager;