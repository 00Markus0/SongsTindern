/* eslint-env browser */
import ApiAuthetificator from "./Authentificator.js";
import {SearchEvent, ArtistEvent, DetailsEvent, SongPlayingEvent} from "../utils/HelperEvents.js";
import Config from "../utils/Config.js";
import Toast from "../ui/Toast.js";
import { Event } from "../utils/Observer.js";

// In dieser Datei werden alle Zugriffe auf die Spotify API verwaltet:

var authentificator, // dient dem Authentifizieren der App, ApiAuthentificator-Objekt
    observer, // dient der Kommunikation mit dem Rest der Anwendung, Observer-Objekt
    storageManager; // dient dem Speicher und laden von Daten aus dem Anwendungsspeicher, StorageManager-Obejekt.

// Diese Funktion überprüft, ob die Api Anfrage erfolgreich ist und nimmt Maßnahmen vor falls nicht.
function responseOkay(response) {
    if(response.status === Config.STATUS_CODE_OKAY || response.status === Config.STATUS_CODE_NO_CONTENT || response.status === Config.STATUS_CODE_CREATED) {
        // Anfrage erfolgreich
        return true;
    } else if(response.status === Config.STATUS_CODE_AUTH_EXPIRED) {
        // Anfrage nicht erfolgreich, erstell einen neuen Authenfizieurngstoken
        refreshAccessToken();
        return false;
    } else if(response.status === Config.STATUS_CODE_NOT_FOUND) {
        // Anfrage nicht erfolgreich, vermutlich ist die Internetverbindung unterbrochen
        Toast.deviceOfflineToast();
    } else if (response.status === Config.STATUS_CODE_NOT_PREMIUM) {
        // Anfrage nicht erfolgreich, weil dem Nutzer Funktionen fehlen
        Toast.premiumNeededToast();
    } else if(response.status === Config.STATUS_CODE_TO_MANY_REQUESTS) {
        // Anfrage nicht erfolgreich, weil zu viele API Anfragen gestellt wurden (sollte kaum vorkommen)
        Toast.sendApiLimitToast();
    } else if(response.status === Config.STATUS_CODE_BAD_GATEWAY) {
        // Anfrage nicht erfolgreich, weil der zwischen Server keine Verbindung zum Hauptserver herstellen konnte
        // Diese Problem liegt leider bei Spotify und kann von uns nicht behoben werden, sollte aber zu keinem Absturz führen
        
    } else {
        // Anfrage nicht erfolgreich weil etwas anderes schief gelaufen ist (sollte nicht vorkommen)
        Toast.sendApiErrorToast(response.responseText);
    }

    return false;
}

// Da alle Anfragen an die API eine ähnliche Form haben, die sich nur durch Methode (PUT/GET), url, callback und body unterscheiden
// erlaubt es diese Funktion API-Anfragen einheitlich zu verarbeiten
function makeApiRequest(method, url, callback, body){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + storageManager.accessToken);
    if(body === null || body === undefined){
        xhr.send();
    } else {
        xhr.send(body);
    }
    xhr.onload = callback;
}

// Ist der Access-Token abgelaufen, muss mit Hilfe des Authentifikators ein neuer erzeugt werden.
function refreshAccessToken() {
    var now;
    // Falls das Spiel gerade läuft wird der zwischenstand gespeichert um ihn nach der Authentifikation wieder her zustellen und keine Infos zu verlieren
    if(storageManager.getGameRunning()) {
        now = new Date();
        now = now.getTime();
        // Ist allerdings der Token schon sehr alt wird davon ausgegangen, dass man seine Infos nicht mehr braucht.
        if(now-storageManager.lifeTimeToken > Config.ONE_DAY_IN_MS) {
            storageManager.setGameStopped();
        }
        storageManager.saveGameState();
    }
    authentificator.refreshToken();
}

// Dieser Callback wird aufgerufen, wenn man ein Suchergebnis gefunden hat. Dann werden alle Listener über dieses mit einem SearchEvent informiert.
function searchCallback(){
    var data, event;

    if(responseOkay(this)) {
        data = JSON.parse(this.responseText);
        event = new SearchEvent(data);
        observer.notifyAll(event);
    }
}

// Dieser Callback wird aufgerufen, wenn man Informationen über einen Benutzer anfragt, user id wird gespeichert.
function userInformationCallback(){
    var data;

    if(responseOkay(this)) {
        data = JSON.parse(this.responseText);
        storageManager.setUserId(data.id);
        checkPlaylist();
    }
}

// Überprüfen mittels API-Anfrage, ob der Name der Playlist schon vorhanden ist, um Songs zu einer existierenden Playlist hinzufügen zu können.
function checkPlaylist(){
    let url = Config.SPOTIFY_USER_PLAYLIST_LIST_URL;
    makeApiRequest("GET", url, playlistsCallback);
}

// Callback, bei dem überprüft wird, ob Playlist schon vorhanden ist.
// Wenn ja, dann sollen die Songs zu der existierenden Playlist hinzugefügt werden.
// Wenn nicht, dann soll eine neue Playlist erstellt werden.
function playlistsCallback(){
    var data, playlists, playlistName;

    if(responseOkay(this)) {
        data = JSON.parse(this.responseText);
        playlists = data.items;
        playlistName = storageManager.playlistname;
        
        // Falls keine Playlist mit diesem Namen beim Nutzer vorliegt wird eine neue erstellt.
        if(!playlistExists(playlistName, playlists)) {
            createPlaylist(storageManager.playlistname);
        }
    }
}

// Es wird überprüft, ob eine Playlist mit dem gewünschten Namen schon vorliegt, falls ja wird dessen ID weiterverwendet.
function playlistExists(playlistName, playlists) {
    for (let i = 0; i < playlists.length; i++){
        let playlist = playlists[i];
        if(playlist.name === playlistName){

            observer.notifyAll(new Event(Config.PLAYLIST_READY_EVENT, playlist.id));

            return true;
        }
    }
    return false;
}

// Aufgerufen wenn ein Song pausiert wurde
function pauseCallback(){
    responseOkay(this);
}

// Aufgerufen wenn ein Song gequeued wurde
function queueCallback(){
    responseOkay(this);
}

// Aufgerufen wenn ein Song geskippt wurde
function skipCallback(){
    responseOkay(this);
}

// Aufgerufen wenn das Abspielen gestartet wurde
function playCallback(){
    if(responseOkay(this)) {
        observer.notifyAll(new SongPlayingEvent());
    }
}

// Aufgerufen, wenn die Informationen über einen Künstler geladen wurden (um das Genre eines Songs heraus zu finden, da dieses von Spotify nur mit dem Künstler gespeichert wird).
function artistInfoCallback(){
    var data, event;
    if(responseOkay(this)) {
        data = JSON.parse(this.responseText);
        event = new ArtistEvent(data);
        observer.notifyAll(event);
    }
}

//Wird aufgerufen, wenn eine Playlist erstellt wurde und die Informationen dieser können abgerufen werden, speichern der playlist id
function testPlaylistCallback() {
    var data;
    if(responseOkay(this)) {
        data = JSON.parse(this.responseText);
        observer.notifyAll(new Event(Config.PLAYLIST_READY_EVENT, data.id));
    }
}

//Wird aufgerufen, wenn ein Item zu einer Playlist hinzugefügt wurde
function addItemCallback(){
    responseOkay(this);
}

// Erstellt eine neue Spotify-Playlist, der Name der Playlist wird übergeben
function createPlaylist(newPlaylistName){
    var body = {name: newPlaylistName};
    body = JSON.stringify(body);
    let url = Config.SPOTIFY_CREATE_PLAYLIST_URL;
    url = url.replace("$user_id", storageManager.userId);
    
    makeApiRequest("POST", url, testPlaylistCallback, body);
}

// Dieser Callback wird aufgerufen wenn versucht wird eine Playlist abzuspielen.
function playPlaylistCallback(){
    responseOkay(this);
}

// Dieser Callback wird aufgerufen, wenn versucht wurde Detail-Informationen über einen Song zu laden.
function songDetailsCallback(){
    var data, event;

    if(responseOkay(this)) {
        data = JSON.parse(this.responseText);
        event = new DetailsEvent(data);
        observer.notifyAll(event);
    }
}

function seekCallback() {
    responseOkay(this);
}

// Die ApiManager-Klasse kapselt Anfragen an die API nach außen.
class ApiManager {

    constructor(observe, storage){
        // Der ApiAuthentifikator kapselt die Anmeldung des Nutzers bei Spotify
        authentificator = new ApiAuthetificator(storage);

        observer = observe;
        storageManager = storage;
    }

    // Startet den Authentifizierungs-Prozess über den ApiAuthentificator.
    startAuthentification() {
        authentificator.requestAuth();
    }

    // Anfrage an die API, um die User Informationen zu erhalten.
    getUserInformation(){
        let url = Config.SPOTIFY_GET_USER_ID_URL;
        makeApiRequest("GET", url, userInformationCallback);
    }

    // Erstellen einer neuen Playlist mittels Anfrage an die API.
    createNewPlaylist() {
        let url = Config.SPOTIFY_GET_USER_ID_URL;
        makeApiRequest("GET", url, userInformationCallback);
    }

    // Nach der Authentifizierung wird man von Spotify zurück auf die Seite geleitet, dann steckt in der URL 
    // der für die Authetifizierung nötige Zugangscode, dieser muss ausgelesen und dann weiterverwendet werden.
    handleRedirect() {
        var code = authentificator.parseCode();
        authentificator.fetchToken(code);
    }

    // Mit dieser Funktion kann über die URL zu einem Song, Information über den Interpreten geladen werden 
    //(um das Genre des Songs herauszufinden, da dieses von Spotify nur für Interpreten nicht Songs gespeichert wird).
    getArtistInfo(url){
        makeApiRequest("GET", url, artistInfoCallback);
    }

    // Diese Methode stellt eine Suchanfrage an die API nach <query> und gibt das <offset>-ste Ergebnis zurück.
    searchSong(query, offset){
        let url = Config.SPOTIFY_SEARCH_URL;
        url = url.replace("$randomQuery", query);
        url = url.replace("$randomOffset", offset);
  
        makeApiRequest("GET", url, searchCallback);
    }

    // Mit Hilfe dieser Methode können Detail-Informationen (wie danceability, vocalness, etc.) von der API abgefragt werden.
    loadSongDetails(songId){
        let url = Config.SPOTIFY_SONG_DETAILS_URL;
        url = url.replace("$id", songId);
        makeApiRequest("GET", url, songDetailsCallback);
    }

    // Diese Funktion fügt die übergebene Liste an Song-Objekten der Playlist mit der übergebenen ID hinzu.
    addMultipleSongsToPlaylist(songs, playlistId) {
        let url = Config.SPOTIFY_ADD_MULTIPLE_ITEMS_TO_PLAYLIST_URL, body, counter;
        url = url.replace("$playlist_id", playlistId);

        body = {
            uris: [],
        };

        counter = 0;

        // Die Spotify-Api lässt nur das Hinzufügen von 50 Songs gleichzeitig zu, daher wird die Liste in Blöcke von 
        // < 50 Songs aufgeteilt und für jeden Block eine API-Anfrage gestellt.
        for(let i = 0; i < songs.length; i++){
            body.uris.push(songs[i].uri);
            counter++;
            if(counter === Config.MAX_PLAYLIST_REQUEST_SONGS){
                makeApiRequest("POST", url, addItemCallback, JSON.stringify(body));
                counter = 0;
                body.uris = [];
            }
        }

        makeApiRequest("POST", url, addItemCallback, JSON.stringify(body));
    }
    
    // Diese Methode pausiert die Wiedergabe.
    pausePlayback(){
        let url = Config.SPOTIFY_PAUSE_URL;
        url = url.replace("$device", storageManager.deviceId);
        makeApiRequest("PUT", url, pauseCallback);
    }

    // Diese Methode fügt den übergebenen Song in die Warteliste ein.
    putNextSong(song){
        let url = Config.SPOTIFY_QUEUE_URL;
        url = url.replace("$device", storageManager.deviceId);
        url = url.replace("$songuri", song.songUri);
        makeApiRequest("PUT", url, queueCallback);
    }

    // Diese Methode überspringt den aktuellen Song.
    skipToNextSong(){
        let url = Config.SPOTIFY_NEXT_URL;
        url = url.replace("$device", storageManager.deviceId);
        makeApiRequest("PUT", url, skipCallback);
    }

    // Diese Methode spielt eine Playlist ab, deren ID übergeben wird.
    playPlaylist(playlistID) {
        let url = Config.SPOTIFY_PLAY_URL,
            context = Config.SPOTIFY_PLAYLIST_CONTEXT,
            body;
        url = url.replace("$device", storageManager.deviceId);

        context = context.replace("$id", playlistID);

        body = JSON.stringify({
            // ESLint warnt vor der variablenschreibweise, diese ist allerdings von Spotify 
            // vorgegeben und kann nicht geändert werden.
            // eslint-disable-next-line       
            context_uri: context,
            offset: {
                position: 0,
            },
        });

        makeApiRequest("PUT", url, playPlaylistCallback, body);
    }

    // Diese Methode spielt den Song ab, dessen uri übergeben wurde.
    playSong(uri){
        let url = Config.SPOTIFY_PLAY_URL,
            body;
        url = url.replace("$device", storageManager.deviceId);

        body = JSON.stringify({
            uris: [uri],
        });

        makeApiRequest("PUT", url, playCallback, body);
    }

    // Ein neuer Authentifizierungs-Token wird über diese Methode geladen.
    refreshAuthToken() {
        refreshAccessToken();
    }

    seekToPos(position) {
        let url = Config.SPOTIFY_SEEK_TO_POS_URL;
        url = url.replace("$position", position);

        makeApiRequest("PUT", url, seekCallback);
    }

}

export default ApiManager;