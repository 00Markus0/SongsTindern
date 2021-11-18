/* eslint-env browser */
import Config from "../utils/Config.js";
import { removeFirstWord, makeFirstLetterUpperCase } from "../utils/HelperFunctions.js";

// Diese Datei stellt ein Objekt zur Verfügung, dass einen Song mit allen nötigen Informationen repräsentiert.

// Mit dieser Funktion lässt sich ein Song-Objekt aus dem JSON-String im LocalStorage erzeugen.
function getSongFromSavedJson(jsonData){
    return new Song(jsonData.title, jsonData.artist, jsonData.coverImage, jsonData.length, jsonData.url, jsonData.uri, jsonData.id, jsonData.genre, jsonData.timeSwiped, jsonData.acousticness, jsonData.instrumentalness, jsonData.danceability, jsonData.playlist, jsonData.playlistId, jsonData.isDuplicate);
}

// Diese Funktion erzeugt ein neues Song-Objekt mit den nötigen Infos aus den JSON-Objekten, welche die API liefert.
function getSongFromJsonResponse(jsonDataSong, jsonDataArtist) {
    var title, artist, coverImage, length, url, uri, id, genre,
        newSong;
    
    title = jsonDataSong.name;
    artist = jsonDataSong.artists[0].name;
    coverImage = jsonDataSong.album.images[0].url;
    length = jsonDataSong.duration_ms;
    url = jsonDataSong.external_urls.spotify;
    uri = jsonDataSong.uri;
    id = jsonDataSong.id;
    genre = jsonDataArtist.genres[0];

    // Das Genre wird so verändert, dass das erste Wort entfernt wird, wenn mehr als eins vorhanden ist, da dieses 
    //meist eine Spezifizierung z.B. "-deep- german Hip Hop" ist.
    genre = removeFirstWord(genre);
    genre = makeFirstLetterUpperCase(genre);
    
    newSong = new Song(title, artist, coverImage, length, url, uri, id, genre);

    return newSong;
}

// In einem Song-Objekt werden alle für unsere Anwendung wichtigen Aspekte eines Songs gespeichert.
class Song {

    // Der Konstruktor bekommt alle Details zu einem Song übergeben.
    constructor(title, artist, coverImage, length, url, uri, id, genre, timeSwiped, acousticness, instrumentalness, danceability, playlist, playlistId, isDuplicate){
        this.title = title;
        this.artist = artist;
        this.coverImage = coverImage;
        this.length = length;
        this.url = url;
        this.uri = uri;
        this.id = id;

        // Werden diese Informationen nicht übergeben, werden die Attribute auf initiale Werte gesetzt.
        if(timeSwiped === undefined){
            this.timeSwiped = -1;
        } else {
            this.timeSwiped = timeSwiped;
        }
        if(genre === undefined || genre === null || genre === "" || genre === "undefined"){
            this.genre = "Undefined";
        } else {
            this.genre = genre;
        }
        if(acousticness === undefined || acousticness === null || acousticness === "") {
            this.acousticness = false;
        } else {
            this.acousticness = acousticness;
        }
        if(instrumentalness === undefined || instrumentalness === null || instrumentalness === ""){
            this.instrumentalness = false;
        } else {
            this.instrumentalness = instrumentalness;
        }
        if(danceability === undefined || danceability === null || danceability === 0){
            this.danceability = 0;
        } else {
            this.danceability = danceability;
        }
        if(playlist === undefined || playlist === null || playlist === "") {
            this.playlist = Config.PLAYLIST_NAME_DEFAULT;
        } else {
            this.playlist = playlist;
        }
        if(playlistId === undefined || playlistId === null){
            this.playlistId = null;
        } else {
            this.playlistId = playlistId;
        }
        if(isDuplicate === undefined || isDuplicate === null || isDuplicate === "") {
            this.isDuplicate = false;      
        } else {
            this.isDuplicate = isDuplicate;
        }
    }

    // Gibt die URI eines Songs zurück.
    get songUri(){
        return this.uri;
    }

    // Setzt die Details für einen Song (danceability und instrumentalness und acousticness), wenn diese von der API geladen wurden.
    setSongDetails(detailsJson) {  
        this.danceability = detailsJson.danceability;
        if(detailsJson.acousticness > Config.SPLIT_VALUE_FOR_ACOUSTICNESS) {
            this.acousticness = true;
        } else {
            this.acousticness = false;
        }
        if(detailsJson.instrumentalness > Config.SPLIT_VALUE_FOR_INSTRUMENTALNESS) {
            this.instrumentalness = true;
        } else {
            this.instrumentalness = false;
        }
    }

    // Setzt den Zeitpunkt, wann ein Song geswipt wurde auf die aktuelle Zeit.
    setSwipeTime(){
        this.timeSwiped = new Date();
    }

    // Setzt die Playlist, zu der ein Song gehört.
    setPlaylist(name, id){
        this.playlist = name;
        this.playlistId = id;
    }

    // Setzt den Song auf ein Duplikat (wird für das Anzeigen in der HistoryView benötigt).
    makeDuplicate(){
        this.isDuplicate = true;
    }
}

export default Song;
export {getSongFromJsonResponse, Song, getSongFromSavedJson};