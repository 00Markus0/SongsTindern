/* eslint-env browser */
import Config from "../utils/Config.js";
import { getSongFromSavedJson } from "../song/Song.js";
import { getIndexOfSongInList, findGenreInList, removeSongWithId } from "../utils/HelperFunctions.js";

// In dieser Datei werden Funktionen gekapselt, die Zufriffe auf den Anwenungsspeicher ermöglichen.

/* Variablen der Storage-Manager-Klasse. 
    currentRoundLikedSongs speichert die Songs solange im Localstorage bis der Benutzer auf "Return to start menu" klickt.
    D.h. wenn der Benutzer den Runden-typ aendert wird diese Variable von neuem befuellt.
    Im Gegensatz dazu bleibt currentSessionLikedSongs auch nach Klicken auf "Return to start menu" bestehen.
*/
var currentSessionLikedSongs, // Eine Session beinhaltet alle Aktionen die der User solange die Anwendung am laufen ist durchführt
    currentRoundLikedSongs; // Eine Runde beinhaltet alle Aktionen die der User ab dem Klick auf einen Gamemode button bis zum zurückkehren in den Startview durchführt (ab hier wieder leer)

// Nur die oberen beiden Methoden müssen verändert werden, um die Art der Speicherung zum Beispiel vom LocalStorage auf eine Datenbank zu ändern.
    
// Platziert ein Element im LocalStorage unter dem Schlüssel <key>.
function save(key, content){
    localStorage.setItem(key, content);
}

// Lädt ein Element, dass unter dem Schlüssel <key> verfügbar ist aus dem LocalStorage.
function load(key){
    return localStorage.getItem(key);
}

// Lädt eine Playlist aus dem LocalStorage
function loadPlaylists() {
    var playlists = load(Config.PLAYLISTS_KEY);

    //Wenn die Playlist richtig geladen wurde, wird sie  in der Liste aller Playlists.
    if(playlists === undefined || playlists === null || playlists === "") {
        playlists = [];
    } else {
        playlists = JSON.parse(playlists);
    }

    return playlists;
}

// Speichert die Liste aller Playlists.
function savePlaylists(playlists) {
    save(Config.PLAYLISTS_KEY, JSON.stringify(playlists));
}

// Diese Funktion lädt die Liste der geswipten Songs aus dem LocalStorage oder erzeugt sie neu falls sie nicht existiert.
function getSwipedList(){
    var swipedList = load(Config.SWIPED_SONGS_HISTORY_KEY),
        swipedObjects = [];

    if(swipedList === undefined || swipedList === null || swipedList === "null"){
        swipedList = [];
    } else {
        swipedList = JSON.parse(swipedList);

        for(let i = 0; i < swipedList.length; i++){
            // Die Songs werden in Objekte mit Methoden umgewandelt.
            let songObject = getSongFromSavedJson(swipedList[i]);
            swipedObjects.push(songObject);
        }

        swipedList = swipedObjects;
    }

    return swipedList;
}

// Diese Funktion speichert die Liste der geswipten Songs.
function saveSwipedList(list){
    save(Config.SWIPED_SONGS_HISTORY_KEY, JSON.stringify(list));
}

// Gibt die Zahl der gehörten Songs zurück.
function getSongCount(){
    return load(Config.SONG_COUNT_KEY);
}

// Speichert die übergebene Zahl der gehörten Songs.
function saveSongCount(songCount) {
    save(Config.SONG_COUNT_KEY, songCount);
}

// Gibt die Zahl der Likes oder 0 zurück, falls diese noch nicht gespeichert wurden.
function getLikeCounter() {
    var likeCounter = load(Config.LIKE_COUNTER_KEY);

    if(likeCounter === undefined || likeCounter === null) {
        return 0;
    }

    return parseInt(likeCounter);
}

// Speichert die übergebene Zahl der Likes.
function saveLikecounter(likes){
    save(Config.LIKE_COUNTER_KEY, likes.toString());
}

// Lädt die Zahl der Dislikes oder gibt 0 zurück, falls diese noch nicht gespeichert wurde.
function getDislikes(){
    var dislikeCounter = load(Config.DISLIKE_COUNTER_KEY);

    if(dislikeCounter === undefined || dislikeCounter === null){
        return 0;
    }

    return parseInt(dislikeCounter);
}

// Speichert die Zahl der Dislikes.
function saveDislikes(dislikes) {
    save(Config.DISLIKE_COUNTER_KEY, dislikes.toString());
}

// Diese Funktion lädt die GenreList aus dem LocalStorage und wandelt alle Element in GenreElement-Objekte um.
function getGenreList() {
    var genreList = load(Config.GENRE_LIST_KEY),
        genreObjectList = [];

    if(genreList === null || genreList === undefined) {
        return [];
    }

    genreList = JSON.parse(genreList);

    for(let i = 0; i < genreList.length; i++){
        genreObjectList.push(getGenreElementFromJsonObject(genreList[i]));
    }

    return genreObjectList;
}

// Speichert die Genre Liste im LocalStorage.
function saveGenreList(list) {
    save(Config.GENRE_LIST_KEY, JSON.stringify(list));
}

function savePausedState(bool) {
    save(Config.PAUSED_KEY, JSON.stringify(bool));
}

function getPausedState() {
    return JSON.parse(load(Config.PAUSED_KEY));
}

// Speichert den in mode übergebenen Spielmodus, der gewählt wurde.
function setGamemode(mode) {
    save(Config.GAMEMODE_KEY, mode);
}

// Die StorageManager Klassse kapselt Zugriffe auf den Speicher nach außen.
class StorageManager {

    constructor() {
        currentSessionLikedSongs = [];
        currentRoundLikedSongs = [];
    }

    // Füge einen Song, der in der data des Events steckt zur Liste der gelikten Songs hinzu.
    addSongToSwiped(event){
        var song = event.data, 
            swipedList = getSwipedList();

        swipedList.push(song);

        saveSwipedList(swipedList);
    }

    // Speichern der Songliste im LocalStorage.
    saveSavedSongsList(songList) {
        saveSwipedList(songList);
    }

    // Getter für die Liste der gelikten Songs.
    get swipedSongsList(){
        var swipedList = getSwipedList();

        return swipedList;
    }

    // Entfernt einen Song aus der Liste der gelikten Songs.
    removeSongFromLikedList(song){
        var swipedList = getSwipedList(),
            id = getIndexOfSongInList(song, swipedList);
        
        removeSongWithId(id, swipedList, saveSwipedList);

        if(getIndexOfSongInList(song, swipedList) !== -1) {
            this.removeSongFromLikedList(song);
        }
    }

    // Speichert die übergebene Liste im LocalStorage.
    callSaveSwipedList(list){
        saveSwipedList(list);
    }

    // Speichert den Namen der aktuell zu erstellenden Speicher im Anwendungsspeicher zwischen.
    setNewPlaylistName(name) {
        save(Config.NEW_PLAYLIST_NAME_KEY, name);
    }

    // Getter für den Namen der aktuell zu erstellenden Playlist.
    get currentPlaylist() {
        return load(Config.NEW_PLAYLIST_NAME_KEY);
    }

    // Getter für die Id der zuletzt erstellten Playlist.
    get currentPlaylistId() {
        return load(Config.PLAYLIST_ID_KEY);
    }

    // Über das SongCount Attribut kann abgefragt werden, wieviele Songs man schon gehört hat,
    // wurden noch keine Songs geswipet wird 0 zurückgegeben.
    get songCount(){
        var count = getSongCount();

        if(count === undefined || count === null) {
            return 0;
        }

        return count;
    }

    // Diese Methode erhöht den SongCount um 1 und speichert ihn dann im LocalStorage
    // Liegt im LocalStorage noch kein SongCount wird dieser mit 1 initialisiert
    increaseSongCount(){
        var count = getSongCount();

        if(count === undefined) {
            count = 0;
        }
        count++;
        saveSongCount(count);
    }

    // Gibt die Zahl der gelikten Songs zurück
    get likeCounter(){
        return getLikeCounter();
    }

    // Lädt die Zahl der geliketen Songs, erhöht sie um 1 und speichert sie zurück.
    increaseLikeCounter() {
        var likes = getLikeCounter();
        likes++;
        saveLikecounter(likes);
    }

    // Gibt die Zahl der gedislikten Songs zurück.
    get dislikeCounter() {
        return getDislikes();
    }

    // Lädt die Zahl der gedislikten Songs erhöht sie um 1 und speichert die Zahl.
    increaseDislikeCounter() {
        var dislikes = getDislikes();
        dislikes++;
        saveDislikes(dislikes);
    }

    // Lädt die Liste der gelikten Songs und erhöht den Wert der likes um 1 oder erzeugt das GenreObjekt, falls das Genre zum ersten mal geliket wurde.
    updateGenreList(event) {
        var song = event.data,
            list = getGenreList(),
            indexOfGenre;

        indexOfGenre = findGenreInList(song.genre, list);

        if(indexOfGenre !== -1) {
            // Die Informationen, also die Auftretenshäufigkeit und die Likehäufigkeit werden aktualisiert.
            list[indexOfGenre].increaseOccurences();
            list[indexOfGenre].increaseSwipesRight();
        } else {
            let newObj = new GenreElement(song.genre);
            newObj.increaseSwipesRight();
            list.push(newObj);
        }

        saveGenreList(list);
    }

    // Falls das Genre des Songs schon im Speicher abgelegt wurde, wird die Zahl der Dislikes für dieses Genre erhöht.
    increaseGenreSwipesLeft(event) {
        var song = event.data,
            list = getGenreList(),
            indexOfGenre;
    
        if(song.genre === undefined || song.genre === null) {
            return;
        }
        
        indexOfGenre = findGenreInList(song.genre, list);
        if(indexOfGenre !== -1) {
            list[indexOfGenre].increaseSwipesleft();
            saveGenreList(list);
        }
    }

    // Getter für die Liste der gelikten Genres zurück.
    get genreList(){
        return getGenreList();
    }

    // Setzt den gewünschten Playerzustand auf pausiert.
    setPaused() {
        savePausedState(true);
    }

    // Setzt den gewünschten Playerzustand auf gestartet.
    setResumed() {
        savePausedState(false);
    }

    // Getter für den aktuell gewünschten Playerzustand.
    get paused() {
        return getPausedState();
    }

    // Fügt den im Event übergebenen Song der Liste der in dieser Session geliketen Songs hinzu.
    addToCurrentSessionLikedSongs(event) {
        var song = event.data;
        currentSessionLikedSongs.push(song);
    }

    // Fügt den übergebenen Song der Liste der in dieser Session geliketen Songs hinzu.
    addSongToCurrentSessionLikedSongs(song) {
        currentSessionLikedSongs.push(song);
    }

    // Löscht die in dieser Session geliketen Songs.
    clearCurrentSessionLikedSongs() {
        currentSessionLikedSongs = [];
    }

     // Fügt den im Event übergebenen Song der Liste der in dieser Runde geliketen Songs hinzu.
    addToCurrentRoundLikedSongs(event) {
        var song = event.data;
        currentRoundLikedSongs.push(song);
        save(Config.CURRENT_ROUND_LIKED_SONGS_KEY, JSON.stringify(currentRoundLikedSongs));
    }

    // Die Liste der in dieser Runde gelikten Songs wird gelöscht.
    clearCurrentRoundLikedSongs() {
        currentRoundLikedSongs = [];
        save(Config.CURRENT_ROUND_LIKED_SONGS_KEY, currentRoundLikedSongs);
    }

    // Getter für die Liste der in dieser Runde gelikten Songs.
    get likedSongsFromCurrentRound(){
        let likedSongsCurrentRound = load(Config.CURRENT_ROUND_LIKED_SONGS_KEY);
        if(likedSongsCurrentRound !== undefined && likedSongsCurrentRound !== null && likedSongsCurrentRound !== ""){
            return JSON.parse(likedSongsCurrentRound);
        }
        return [];
    }

    // Setter für die Liste der in dieser Session gelikten Songs.
    set currentLikes(likes) {
        currentSessionLikedSongs = likes;
    }

    // Getter für die in dieser Session gelikten Songs.
    get currentLikes() {
        return currentSessionLikedSongs;
    }

    // Getter für die Liste aller erstellten Playlists.
    get playlistsList() {
        return loadPlaylists();
    }

    // Fügt eine neue durch Name und ID identifizierte Playlist der Liste aller Playlists hinzu und speichert diese.
    addToPlaylists(playlistname, playlistId) {
        var playlists = loadPlaylists(),
            newPlaylist = {
                name: playlistname,
                id: playlistId,
            };
        
        playlists.push(newPlaylist);
        savePlaylists(playlists);

        return newPlaylist;
    }

    // Speichert die Information, dass man von der History nicht vom swipen in die Playlistauswahl kommt.
    setComingFromHistory(isFromHistory) {
        save(Config.IS_FROM_HISTORY_KEY, isFromHistory);
    }

    // Getter für die Information, ob man von der History in die Playlistauswahl kommt.
    get fromHistory() {
        var isFromHistory;
        isFromHistory = load(Config.IS_FROM_HISTORY_KEY);

        if(isFromHistory === undefined) {
            return false;
        }

        return JSON.parse(isFromHistory);

    }

    // Speichert die Information, dass aktuell eine Runde läuft.
    setGameRunning() {
        save(Config.GAME_RUNNING_KEY, JSON.stringify(true));
    }

    // Speichert die Information, dass aktuell kein Spiel mehr läuft.
    setGameStopped() {
        save(Config.GAME_RUNNING_KEY, JSON.stringify(false));
    }

    // Erlaubt die Abfrage, ob aktuell ein Song läuft.
    getGameRunning() {
        var gameRunning;
        gameRunning = load(Config.GAME_RUNNING_KEY);
        if(gameRunning === null || gameRunning === undefined) {
            return false;
        }
        return JSON.parse(gameRunning);
    }

    // Setzt den Spielmodus auf Normal.
    setGameodeNormal() {
        setGamemode("Normal");
    }

    // Setzt den Spielmodus auf Hidden.
    setGamemodeHidden() {
        setGamemode("Hidden");
    }

    // Setzt den Spielmodus auf Random.
    setGamemodeRandom() {
        setGamemode("Random");
    }

    // Setzt den Spielmodus auf Hard.
    setGamemodeHard() {
        setGamemode("Hard");
    }

    // Getter für den gewählten Spielmodus.
    get gamemode() {
        var gamemode = load(Config.GAMEMODE_KEY);
        if(gamemode === undefined || gamemode === null) {
            return "Normal";
        }

        return gamemode;
    }

    // Speichert den Spielzustand identifiziert durch die in dieser Runde gelikten Songs und den Spielmodus.
    saveGameState() {
        // Save state
        let gameState = {
            likedSongs: this.likedSongsFromCurrentRound,
            gameMode: this.gamemode,
        };

        save(Config.GAME_STATE_KEY, JSON.stringify(gameState));
    }

    // Getter für den gespeicherten Spielmodus.
    get gamestate() {
        var gamestate = load(Config.GAME_STATE_KEY);
        if(gamestate === undefined || gamestate === null) {
            if(this.gamemode !== undefined) {
                return {
                    gameMode: this.gamemode,
                    likedSongs: [],
                };
            }
            return {
                    gameMode: "Normal",
                    likedSongs: [],
            };
            
        }

        return JSON.parse(gamestate);
    }

    // Speichert die ID des authentifizierten Nutzers.
    setUserId(userId) {
        save(Config.USER_ID_KEY, userId);
    }

    // Getter für den Namen der aktuell zu erstellenden Playlist.
    get playlistname () {
        return load(Config.NEW_PLAYLIST_NAME_KEY);
    }

    // Getter für den Authentifizierungstoken von der SpotifyApi.
    get accessToken() {
        return load(Config.SPOTIFY_ACCESS_TOKEN_KEY);
    }

    // Getter für die ID des authentifizierten Nutzers.
    get userId() {
        return load(Config.USER_ID_KEY);
    }

    // Speichert die DeviceId des Spitify Webplayers.
    setDeviceID(deviceId){
        save(Config.SPOTIFY_DEVICE_ID_KEY, deviceId);
    }

    // Getter für die ID der aktuellen Playlist.
    get playlistId() {
        return load(Config.PLAYLIST_ID_KEY);
    }

    // Getter für die Geräteid des Webplayers.
    get deviceId() {
        return load(Config.SPOTIFY_DEVICE_ID_KEY);
    }

    // Getter für die Lebenzeit des Authentifizierungstokens.
    get lifeTimeToken(){
        return load(Config.TOKEN_LIFE_TIME);
    }

    // Speichert den für API Zugriffe nötigen Zugangstoken.
    setAccessToken(accessToken) {
        save(Config.SPOTIFY_ACCESS_TOKEN_KEY, accessToken);
    }

    // Speichert das Ablaufdatum des Authetifizierungstokens.
    setTokenLifeTime(lifetime) {
        var currentTime = new Date();
        currentTime = currentTime.getTime();
        save(Config.TOKEN_LIFE_TIME, (lifetime * Config.SECONDS_TO_MILISECONDS_MULTIPLIER) + currentTime);
    }

    // Speichert den Refresh-Token.
    setRefreshToken(refreshToken) {
        save(Config.SPOTIFY_REFRESH_TOKEN_KEY, refreshToken);
    }

    // Getter für die URL die nach dem Authentifizieren angezeigt werden soll.
    get baseUrl() {
        return load(Config.BASE_URL_KEY);
    }

    // Getter für den Refresh Token.
    get refreshToken(){
        return load(Config.SPOTIFY_REFRESH_TOKEN_KEY);
    }

    // Speichert den für die API nötigen Code.
    setSpotifyApiCode(code){
        save(Config.SPOTIFY_API_CODE_KEY, code);
    }
}

// Mit Hilfe dieser Funktion können aus dem gespeicherten JSON-String der im LocalStorage liegt ein neues GenreElement-Objekt erzeugt werden.
function getGenreElementFromJsonObject(jsonObject){
    var newObj = new GenreElement(jsonObject.name);
    newObj.setOccurences(jsonObject.occurences);
    newObj.setSwipesRight(jsonObject.swipesRight);
    newObj.setSwipesLeft(jsonObject.swipesLeft);
    newObj.setSwipeRate();

    return newObj;
}

// Ein GenreElement repräsentiert ein Genre von dem Songs geliket wurden.
// Dient vor allem der Berechnung der SwipeRate für den StatisticsView.
class GenreElement {
    constructor(name){
        this.name = name;
        this.occurences = 1;
        this.swipeRate = 0;
        this.swipesRight = 0;
        this.swipesLeft = 0;
    }

    setOccurences(occ){
        this.occurences = occ;
    }

    setSwipesRight(right){
        this.swipesRight = right;
    }

    setSwipesLeft(left) {
        this.swipesLeft = left;
    }

    setSwipeRate(){
        this.swipeRate = Math.round((this.swipesRight / (this.swipesRight + this.swipesLeft) * Config.ROUNDING_VALUE_HUNDRED)) / Config.ROUNDING_VALUE_HUNDRED;
    }

    increaseSwipesRight() {
        this.swipesRight++;
        this.setSwipeRate();
    }

    increaseSwipesleft() {
        this.swipesLeft++;
        this.setSwipeRate();
    }

    increaseOccurences() {
        this.occurences++;
    }

    get savableString(){
        return JSON.stringify(this);
    }
}

export default StorageManager;
export {StorageManager, GenreElement};