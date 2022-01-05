/* eslint-env browser */
import Config from "../utils/Config.js";

// Variablen für Toast
var welcomeToastSent = false,
    swipeToastSent = false,
    likedToastSent = false,
    playlistSelectionToastSent = false,
    historyAddToastSent = false,
    rememberToastSent = false;

// Diese Methode sendet eine ToastMessage. Dafür benötigt sie die message und den style (class-Name) als Parameter.
function sendToast(message, useShow, style, time) {
    var toastEl = document.createElement("div"), timeoutTime;
    toastEl.setAttribute("id", "toast");

    toastEl.innerHTML = message;

    document.querySelector("body").appendChild(toastEl);

    if(useShow) {
        toastEl.classList.add("show-toast");
    }

    if(style !== undefined) {
        toastEl.classList.add(style);
    }

    if(time === undefined) {
        timeoutTime = Config.TOAST_DURATION_IN_MS;
    } else {
        timeoutTime = time;
    }

    if(useShow) {
        setTimeout(function(){
            toastEl.classList.remove("show-toast");
            document.querySelector("body").removeChild(toastEl);
        }, timeoutTime);
    }

    if(!useShow){
        setTimeout(function(){
            toastEl.classList.remove(style);
            document.querySelector("body").removeChild(toastEl);
        }, timeoutTime);
    }
}

// ---- Toast Klasse ----

class Toast {

    // sendet den Willkommens-Toast für den Start-screen
    static sendWelcomeToast() {
        if(!welcomeToastSent) {
            sendToast("Select your gamemode!", true);
            welcomeToastSent = true;
        }
    }

    // sendet Toast beim Anfang des Swipens
    static sendSwipeToast() {
        if(!swipeToastSent) {
            sendToast("Double-click card to skip position!", false, "swipe-toast", Config.TOAST_TIME);
            swipeToastSent = true;
        }
    }

    // sendet den Toast beim Liken eines Songs
    static sendLikedToast() {
        if(!likedToastSent) {
            sendToast("Saved song!", true);
            likedToastSent = true;
        }
    }

    // sendet den Toast beim Erstellen der Playlist
    static sendPlaylistSelectionToast() {
        if(!playlistSelectionToastSent) {
            sendToast("Add liked songs to playlists.", true);
            playlistSelectionToastSent = true;
        }
    }

    // sendet den Toast für das Klicken auf die History-View
    static sendHistoryAddToast(songName) {
        if(!historyAddToastSent) {
            sendToast("Select the playlists to include " + songName + ".", false, "swipe-toast", Config.TOAST_TIME);
            historyAddToastSent = true;
        }
    }

    // sendet den Toast für das Adden zu einer Playlist
    static sendPlaylistSelectionAddToast(playlistName) {
        sendToast("Song(s) added to your Spotify-playlist " + playlistName + "!", true);
    }

    // sendet den Toast für das Erstellen einer neuen Playlist
    static sendNewPlaylistToast(playlistName) {
        sendToast("Song(s) added to your new Spotify-playlist " + playlistName + "!", true);
    }

    // sendet den Toast um den User zu informieren, dass die Playlist auf Spotify zu finden ist
    static sendPlaylistsOnSpotifyToast() {
        if(!rememberToastSent) {
            sendToast("Remember: You can find the playlists on Spotify!", true);
            rememberToastSent = true;
        }
    }

    // sendet den Toast um den User zu notifizieren, dass die Verbindung zu SPotify verloren wurde
    static deviceOfflineToast() {
        sendToast("Verbindung zu Spotify verloren!", true, "error-toast");
    }

    // sendet den Toast, dass der User Spotify Premium besitzen muss um unsere Anwendung verwenden zu können
    static premiumNeededToast() {
        sendToast("Spotify Premium membership required!", true, "error-toast");
    }

    // sendet den Toast um zu notifizieren, dass man die Seite neu laden muss
    static initErrorToast() {
        sendToast("Initialization failed, please restart!", true, "error-toast");
    }

    // sendet den Toast dass eine API anfrage fehlgeschlagen ist
    static sendApiErrorToast(message) {
        sendToast("Api Request failed with message: " + message, true, "error-toast");
    }

    // sendet Toast, dass zu viele API anfragen gestellt wurde
    static sendApiLimitToast() {
        sendToast("Too many Api requests, slow down!", true, "error-toast");
    }

    // sendet einen Toast, wenn eine API Anfrage ein Bad Gateway als Antwort bekommt.
    static sendBadGatewayToast() {
        sendToast("Server error from Spotify, sorry not our fault", true, "error-toast");
    }

    // sendet Toast dass die song position auf eine random stille geskipt wurde, oder dass keine skips mehr vorhanden sind
    static sendSkipToast(skipsLeft) {
        if(skipsLeft <= 0) {
            sendToast("No more skips left", true);
        } else {
            let msg = "Skips left: " + (skipsLeft-1);
            sendToast(msg, true);
        }
    }

    static sendHardmodeSkipToast() {
        sendToast("Remember: No skipping in Hard Mode", true);
    }

}

export default Toast;