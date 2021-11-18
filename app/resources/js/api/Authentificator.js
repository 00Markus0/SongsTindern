/* eslint-env browser */
import Config from "../utils/Config.js";
import Toast from "../ui/Toast.js";

// In dieser Klasse wird der Authentifizierungsworkflow der Spotify-API behandelt.

// Die notwendigen URLs zur Authentifizierung
const AUTH_URL = "https://accounts.spotify.com/authorize",
    TOKEN_URL = "https://accounts.spotify.com/api/token";

var storageManager; // StorageManager-Objekt, dass Zurgiffe auf den Anwendungsspeicher kapselt.

// Diese Funktion verarbeitet die Rückgabe der Spotify-Token-Api.
function handleAuthResponse(){
    var data, refreshToken, accessToken;

    // Falls die Anfrage erfolgreich war, wird der Json-String in ein Objekt umgewandelt
    // Aus dem Objekt werden die beiden Token und die Gültigkeitsdauer extrahiert und im LocalStorage abgelegt.
    if(this.status === Config.STATUS_CODE_OKAY){
        data = JSON.parse(this.responseText);

        if(data.access_token !== undefined){
            accessToken = data.access_token;
            storageManager.setAccessToken(accessToken);
            storageManager.setTokenLifeTime(data.expires_in);
        }
        if (data.refresh_token !== undefined){
            refreshToken = data.refresh_token;
            storageManager.setRefreshToken(refreshToken);
        }
        // War die Abfrage der Tokens erfolgreich wird man zurück zur Standard-Seite geleitet.
        window.location.href = storageManager.baseUrl;
    }
    else {
        Toast.sendApiErrorToast(this.responseText);
    }
}

// Diese Funktion stellt eine Anfrage für neue Tokens an die API.
function callAuthorizationApi(body){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN_URL, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", "Basic " + window.btoa(Config.SPOTIFY_API_CLIENT_ID + ":" + Config.SPOTIFY_API_SECRET));
    xhr.send(body);
    xhr.onload = handleAuthResponse;
}

// Die ApiAuthentificator-Klasse kapselt die Anmeldevorgänge nach außen.
class ApiAuthetificator{

    constructor(storage) {
        storageManager = storage;
    }

    // Mit dieser Methode kann ein neuer Code angefordert werden, den man braucht, um erste Tokens zu generieren.
    // Dazu wird die notwendige URL entsprechend der API-Referenz erstellt und der Nutzer dann auf die Website weitergeleitet.
    requestAuth(){
        let url = AUTH_URL;
        url += "?client_id=" + Config.SPOTIFY_API_CLIENT_ID;
        url += "&response_type=code";
        url += "&redirect_uri=" + encodeURI(Config.API_REDIRECT_URI);
        url += "&show_dialog=true";
        // Die notwendigen Berechtigungen der Anwendung werden Spotify in der URL übergeben.
        url += Config.ACCESS_GRANTS;
        window.location.href = url;
    }

    // Diese Methode ließt den Code aus der  URL aus, Spotify leitet einen nach der Freigabe auf die Seite https://<redirect-url>?code=<code> weiter, der Code muss also aus der URL ausgelesen und gespeichert werden.
    parseCode(){
        let code = null;
        const queryString = window.location.search;
        if (queryString.length > 0){
            const urlParms = new URLSearchParams(queryString);
            code = urlParms.get("code");
        }
        storageManager.setSpotifyApiCode(code);
        return code;
    }

    // Mit Hilfe dieser Methode können die ersten Tokens angefragt werden, wenn man den Zugangscode schon erzeugt hat.
    fetchToken(code){
        let body = "grant_type=authorization_code";
        
        body += "&code=" + code;
        body += "&redirect_uri=" + encodeURI(Config.API_REDIRECT_URI);
        body += "&client_id=" + Config.SPOTIFY_API_CLIENT_ID;
        body += "&client_secret=" + Config.SPOTIFY_API_SECRET;
        
        callAuthorizationApi(body);
    }

    // Mit Hilfe dieser Methode können neue Access-Tokens erzeugt werden, wenn man schon einen Refresh-Token hat, also schonmal angemeldet war.
    refreshToken(){
        var refreshToken = storageManager.refreshToken,
            body = "grant_type=refresh_token";
        body += "&refresh_token=" + refreshToken;
        body += "&client_id=" + Config.SPOTIFY_API_CLIENT_ID;
        callAuthorizationApi(body);
    }
}

export default ApiAuthetificator;