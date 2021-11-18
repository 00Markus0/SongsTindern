/* eslint-env browser */

import Config from "./Config.js";
import {getRandomNumber} from "../utils/HelperFunctions.js";
import {CountdownUpEvent} from "../utils/HelperEvents.js";

// In dieser Datei wird die Funktionalität des Swipetimers implementiert, der nach links swiped, wenn die Zeit abgelaufen ist.

var countdownTimeRemaining, // retliche Zeit zum Anhören eines Lieds im swipeView
    speedRoundType, // Art der Speed Runde
    timeoutText, // Text für dem Countdown
    stopCountdown, // Boolean zum beenden des Countdowns
    isSpeedRound, // Boolean zur Abfrage ob der Runde eine speedRound ist
    nextSpeedSong, // die Anzahl an Songs, bis eine Speed Runde gestartet wird
    observer, // Ein Observer, der die Kommunikation mit der restlichen Anwendung erlaubt.
    loadedHTML, // Boolean wenn das Html geladen hat
    countdownRunning, // Boolean zum Schauen ob der Countdown bereits läuft
    songLoaded = false; // Ein Boolean in dem gespeichert wird, ob der Song schon geladen wird, nur dann soll der Countdown laufen. 

//setzt die Zeit des Countdowns je nach speedRoundTyp auf die Default-Zeit zurück (z.B. wenn ein Song gewsiped wird)
function resetCountdown() {
    switch (speedRoundType) {
        case Config.SPEED_ROUND_TYPE_RANDOM_KEY:
            countdownTimeRemaining = Config.DEFAULT_RANDOM_ROUND_DURATION;
            break;
        case Config.SPEED_ROUND_TYPE_HIDDEN_KEY:
            countdownTimeRemaining = Config.DEFAULT_SPEED_ROUND_DURATION;
            break;
        case Config.SPEED_ROUND_TYPE_HARD_KEY:
            countdownTimeRemaining = Config.DEFAULT_HARD_ROUND_DURATION;
            break;
        default:
            countdownTimeRemaining = Config.DEFAULT_SPEED_ROUND_DURATION;
            break;
    }
}

function setSongloaded() {
    songLoaded = true;
}

function setSongnotloaded() {
    songLoaded = false;
}

//Diese Methode ist ein Tick (= 1 sekunde) des Countdowns und wird dazu verwendet den Countdown zu starten
function tickCountdown() {
    if(songLoaded) {
        countdownTimeRemaining -= Config.DEFAULT_TICK_SPEED;
    }
    //Wenn der Countdown stoppen soll (z.B. wenn auf ein anderen Button geklickt wird), dann hört diese Methode auf
    if (stopCountdown) {
        timeoutText.classList.add("disguised");
        countdownRunning = false;
        resetCountdown();
        return;
    }

    //Checkt, ob die verbleibende Zeit animiert werden soll
    if ((countdownTimeRemaining / Config.ONE_SECOND) <= Config.START_ANIMATION_TIME) {
        timeoutText.classList.add("animateCounter");
        timeoutText.addEventListener("animationend", function () {
            timeoutText.classList.remove("animateCounter");
        });
    }
    timeoutText.classList.remove("disguised");
    timeoutText.innerHTML = "00:" + ((countdownTimeRemaining / Config.ONE_SECOND) < Config.TEN_SECONDS ? "0" : "") 
    + (countdownTimeRemaining / Config.ONE_SECOND);

    //Falls der Countdown noch Zeit übrig hat wird ein Timeout gesetzt (standardmäßig 1 sek.) und dann die Methode neu aufgerufen (Rekursion)
    if (countdownTimeRemaining >= Config.DEFAULT_TICK_SPEED) {
        setTimeout(tickCountdown, Config.DEFAULT_TICK_SPEED);
    }

    //Falls der Countdown keine Zeit mehr übrig hat, stoppt er und disliket den aktuellen Song. 
    //Dann setzt er die Zeit zurück
    else if (countdownTimeRemaining <= 0) {
        resetCountdown();
        checkForSpeedRound();
        observer.notifyAll(new CountdownUpEvent());
        setTimeout(tickCountdown, Config.DEFAULT_TICK_SPEED);
    }
}

//This function is called for every new song. It checks if a speed round should be started or not
function checkForSpeedRound() {
    if(!loadedHTML) {
        return;
    }
    if(speedRoundType === "") {
        stopCountdown = true;
        isSpeedRound = false;
    }
    //Speed-round type = random (countdown randomly every 3-7 songs)
    if (speedRoundType === Config.SPEED_ROUND_TYPE_RANDOM_KEY) {
        checkForRandomRound();
    } 
    else if (speedRoundType === Config.SPEED_ROUND_TYPE_HIDDEN_KEY || speedRoundType === Config.SPEED_ROUND_TYPE_HARD_KEY) {
        isSpeedRound = true;
        stopCountdown = false;
        nextSpeedSong = 0;
        resetCountdown();
    }
}

// Funktion wird aufgerufen wenn der Random GameMode aktiviert ist und schaut, ob der Countdown beim aktuellen Song gestartet werden soll
function checkForRandomRound() {
    // Falls die nächste Speed round noch nicht erfolgt (d.h. es noch mehr Songs )
    if (nextSpeedSong > 0) {
        //Countdown stoppen
        if (document.querySelector(".barheader").innerHTML !== " Songs Tindern") {
            document.querySelector(".barheader").innerHTML = " Songs Tindern";
        }
        timeoutText.classList.add("disguised");
        stopCountdown = true;
        isSpeedRound = false;
        nextSpeedSong--;
    } 
    //Nächste Speed round soll jetzt stattfinden
    else if (nextSpeedSong === 0) {
        timeoutText.classList.remove("disguised");
        document.querySelector(".barheader").innerHTML = "SPEEDROUND!";
        isSpeedRound = true;
        stopCountdown = false;
        nextSpeedSong = getRandomNumber(Config.DEFAULT_COUNTDOWN_NUMBER, Config.DEFAULT_COUNTDOWN_NUMBER_OFFSET);
        resetCountdown();
        if(!countdownRunning) {
            tickCountdown();
            countdownRunning = true;
        }
    }
}

// setzt die Variable, wenn das HTML geladen hat
function setLoadedHtml() {
    loadedHTML = true;
    timeoutText = document.getElementById("countdownText");
    checkForSpeedRound();
}

// Wenn ein Song geswiped wurde, wird die Zeit des Countdown zurückgesetzt und geschaut, ob es sich um eine Speed-Runde handelt
function songSwiped() {
    resetCountdown();
    checkForSpeedRound();
}

// wird aufgerufen, wenn der Countdown stoppen soll
function endCountdown() {
    countdownRunning = false;
    stopCountdown = true;
    isSpeedRound = false;
}

// Die Countdown-Klasse kapselt die Funktionalität des Timers nach außen.
class Countdown {
    constructor(countObserver) {
        observer = countObserver;

        isSpeedRound = false;
        speedRoundType = "";
        nextSpeedSong = 0;
        loadedHTML = false;
        stopCountdown = true;
        countdownRunning = false;
        this.resetTime();
        
        observer.addEventListener(Config.CHANGED_TO_SWIPE_VIEW, setLoadedHtml);
        observer.addEventListener(Config.EVENT_SONG_SWIPED_KEY, songSwiped);
        observer.addEventListener(Config.EVENT_SONG_SWIPE_END, endCountdown);
        observer.addEventListener(Config.LIKE_EVENT, setSongnotloaded);
        observer.addEventListener(Config.DISLIKE_EVENT, setSongnotloaded);
        observer.addEventListener(Config.EVENT_SONG_AUDIO_LOADED_KEY, setSongloaded);
    }

    //Diese Methode setzt den Countdown auf die angegeben Zeit zurück
    resetTime() {
        resetCountdown();
    }

    //Diese Methode ist ein Tick (= 1 sekunde) des Countdowns. Diese Methode wird zudem aufgerufen, wenn der Countdown gestartet werden soll
    countdownTick() {
        if(!countdownRunning && isSpeedRound) {
            tickCountdown();
            countdownRunning = true;
        }
    }

    // This fucntion is called for every new song. It checks if a speed round should be started or not
    updateSpeedRound() {
        checkForSpeedRound();
    }

    // setzt den Typ für eine SpeedRound
    setSpeedRoundType(type) {
        if(type === Config.SPEED_ROUND_TYPE_RANDOM_KEY) {
            nextSpeedSong = getRandomNumber(Config.DEFAULT_COUNTDOWN_NUMBER, Config.DEFAULT_COUNTDOWN_NUMBER_OFFSET);
            stopCountdown = false;
            isSpeedRound = true;
        } else if(type === Config.SPEED_ROUND_TYPE_HIDDEN_KEY || type === Config.SPEED_ROUND_TYPE_HARD_KEY) {
            nextSpeedSong = 0;
            stopCountdown = false;
            isSpeedRound = true;
        }
        speedRoundType = type;
        this.updateSpeedRound();
    }
}

export default Countdown;