/* eslint-env browser */
import {Observer, Event} from "./utils/Observer.js";
import ApiManager from "./api/ApiManager.js";
import StorageManager from "./storage/StorageManager.js";
import Config from "./utils/Config.js";

// Erste Datei die aufgerufen wird, wenn die Anwendung gestartet wird. Hier muss der Authtifizierungsvorgang gestartet werden.
var observer = new Observer(),
	storageManager = new StorageManager(),
	apiManager = new ApiManager(observer, storageManager),
	loginButton;

function init() {
	// Falls der Nutzer noch nicht bei Spotify angemeldet ist, muss er das tun:
	if(localStorage.getItem(Config.SPOTIFY_ACCESS_TOKEN_KEY) === null || localStorage.getItem(Config.SPOTIFY_ACCESS_TOKEN_KEY) === undefined){
		if(window.location.search.length > 0){
			// Falls die Website von Spotify nach der Authentifizierung aufgerufen wird, wird die handleRedirect-Methode des APIManagers aufgerufen
			apiManager.handleRedirect();
		} else{
			// Die StandardURL auf der die Anwendung läuft wird gespeichert.
			localStorage.setItem(Config.BASE_URL_KEY, window.location.href);
		}

		// Es wird ein Eventlistener auf den Login-Button registriert.
		// Wird der Login-Button gedrückt wird die startAuthentification-Methode des APIManagers aufgerufen.
		observer.addEventListener(Config.LOGIN_EVENT_KEY, apiManager.startAuthentification);
	
		loginButton = document.querySelector("#buttonLogIn");
		loginButton.addEventListener("click", function(){
			var loginEvent;
			loginEvent = new Event(Config.LOGIN_EVENT_KEY, "");
			observer.notifyAll(loginEvent);
		});
	}
	// Falls der Nutzer schon angemeldet ist, wird er stattdessen direkt zum Startbildschirm weitergeleitet.
	else {
		initAnimation();
		// Setze die URL auf ein lesbares Format zurück:
		window.history.pushState("", "", localStorage.getItem(Config.BASE_URL_KEY));
	}
	
}

// Animation für die Durchführung und den Abschluss der Authorisierung. Nach Ablauf der Animation wird der Nutzer zum MainView weitergeleitet.
function initAnimation() {
	var logInButton = document.getElementById("buttonLogIn"),
		animatedDiv = document.getElementById("animatedDiv"),
		btnHighlight = document.getElementById("btnBorderHighlight"),
		check = document.getElementById("check");

	logInButton.classList.add("hidden");
	animatedDiv.classList.remove("hidden");
	btnHighlight.classList.add("highlight-animation");
	btnHighlight.addEventListener("animationend", function() {
		btnHighlight.removeEventListener("animationend", this);
		check.classList.remove("hidden");
		check.classList.add("check-animation");
		check.addEventListener("animationend", function() {
			check.removeEventListener("animationend", this);
			animatedDiv.classList.add("disappear-animation");
			animatedDiv.addEventListener("transitionend", function() {
				animatedDiv.removeEventListener("transitionend", this);
				animatedDiv.classList.add("hidden");
				redirectToSwipe();
			});
		});
	});
}

// Wenn die Authorisierung vollendet ist, wird automatisch zum main view gewechselt
function redirectToSwipe() {
    window.location.href = Config.REDIRECT_URI;
}

init();