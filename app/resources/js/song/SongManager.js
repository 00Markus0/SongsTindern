/* eslint-env browser */
import Config from "../utils/Config.js";
import {getSongFromJsonResponse} from "./Song.js";
import {getRandomOffset, getRandomSearchRequest} from "../utils/HelperFunctions.js";
import {SongReadyEvent } from "../utils/HelperEvents.js";

var songList, // Eine Liste aller abgespielten Songs dieser Session
    observe, // Ein Observer, der die Kommunikation mit der restlichen Anwendung erlaubt.
    api, // Ein ApiManager, der Anfragen an die API ermöglicht.
    songData, // Daten zu den Songs, die von der API abgerufen wurde als JSON-Strings.
    currentlyLoadingDetails, // Eine Liste der Songs zu denen gerade weitere Infos geladen werden.
    storage; // Ein StorageManager-Objekt, dass den Zugriff auf den Anwendungsspeicher kapselt.

// Diese Funktion startet eine zufällige Suchanfrage nach einem Song
// Da 29 Buchstaben möglich sind, hat man 29*29 Kombinationen mit 1000 verschiedenen Offsets und somit 28*28*1000 = 784000 mögliche Songs.
function makeSearchRequest(){
    var randomRequest = getRandomSearchRequest(),
        randomOffset = getRandomOffset();

    api.searchSong(randomRequest, randomOffset);
}

// Diese Funktion spielt einen übergebenen Song ab.
function playSong(song){
    api.playSong(song.songUri);
}

// Hier wird ein Song in einer Liste ersetzt (z.B. um die Details zu updaten).
function replaceSong(list, song) {
    for (let i = 0; i < list.length; i++){
        if(list[i].id === song.id){
            list[i] = song;
        }
    }

    return list;
}

// Der SongManager kapselt die Operationen auf den Songs wie abspielen, laden, pausieren etc. nach außen.
class SongManager {

    constructor(apiManager, observer, storageManager){
        api = apiManager;

        storage = storageManager;

        observe = observer;
        observe.addEventListener(Config.SEARCH_CALLBACK_EVENT, this.searchResult);
        observe.addEventListener(Config.SONG_READY_EVENT, this.songReady);
        observe.addEventListener(Config.ARTIST_INFO_EVENT, this.artistInfoLoaded);
        observe.addEventListener(Config.SONG_DETAILS_EVENT, this.loadedSongDetails);

        songList = [];
        songData = [];
        currentlyLoadingDetails = [];
    }

    // Mit dieser Methode wird ein neuer zufälliger Song gesucht.
    getNewSong(){
        makeSearchRequest();
    }

    // Wenn die Information über den Künstler zurückkommt, wird ein neues Song Objekt basierend auf den zwischengespeicherten Informationen und den Künstlerinformationen erzeugt
    // und in die Liste der Songs eingefügt, die neu erstellt wird, wenn Sie vorher noch nicht vorhanden war.
    artistInfoLoaded(event) {
        var jsonDataArtist = event.data,
            newSong;
        
        newSong = getSongFromJsonResponse(songData[0], jsonDataArtist);
        songData.shift();

        // Liste neu erzeugen, falls sie nicht vorhanden war:
        if(songList === undefined) {
            songList = [newSong];
        } else{
            songList.push(newSong);
        }

        let songEvent = new SongReadyEvent(newSong);
        observe.notifyAll(songEvent);
    }

    // Song Details für einen Song von der API abfragen und den Song als gerade ladend zwischenspeichern.
    getSongDetailsForSong(index) {
        var song = songList[index];

        currentlyLoadingDetails.push(index);
        api.loadSongDetails(song.id);
    }

    //Song Details für einen Song laden
    loadedSongDetails(event){
        var details = event.data,
            curr = songList[currentlyLoadingDetails[0]],
            savedList = storage.swipedSongsList;

        curr.setSongDetails(details);

        currentlyLoadingDetails.shift();

        savedList = replaceSong(savedList, curr);

        storage.saveSavedSongsList(savedList);
    }

    // Wurde ein zufälliger Song über die API angefragt, so wird aus dem JSON-Ergebnis ein Song-Element gemacht und dieses in der Songliste abgelegt
    searchResult(event){
        var jsonDataSong;

        // Um das Genre eines Songs herauszufinden muss man Informationen über den Interpreten laden.
        // Daher wird eine API Anfrage gestartet und die zurückgegebenen Information zu dem Song zwischengespeichert.
        jsonDataSong = event.data.tracks.items[0];
        if(jsonDataSong !== undefined) {
            api.getArtistInfo(jsonDataSong.artists[0].href);

            songData.push(jsonDataSong);
        }
        else {
            makeSearchRequest();
        }
    }

    // Mit diesem Getter erhält man den aktuellsten Song.
    get currentSong() {
        return songList[songList.length - 1];
    }

    // Song mit einer bestimmten ID zurückgeben.
    getSongwithId(id){
        return songList[id];
    }

    // Diese Methode erlaubt es den aktuellsten Song ab zu spielen.
    playCurrentSong(){
        playSong(this.currentSong, api);
    }

    // Song mit einer bestimmten ID abspielen.
    playSongWithId(id){
        playSong(songList[id], api);
    }
}

export default SongManager;