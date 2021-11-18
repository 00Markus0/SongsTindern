/* eslint-env browser */
/* eslint no-undef: 0 */ // new Hammer is marked as undefined, even though it is defined through the library function
import { GenreElement } from "../storage/StorageManager.js";
import Config from "./Config.js";

// In dieser Datei werden Funktionen abgelegt, die überall in der Anwendung (und auch in anderen Anwendungen) hilfreich sein könnten.

// Ersetzt im übergebenen String alle Zeichen mit - und gibt den veränderten String zurück.
function replaceWithDots(str) {
    return String(str).replace(/[^]/g, "-");
}

// Verkürzt den übergebenen String auf die übergene Länge und ergänzt am Ende "...".
function shorten(string, len) {
    if (string.length >= len) {
        let shortendString = string.substring(0, len - Config.SHORTEN_STRING_VALUE) + "...";
        return shortendString;
    }
    return string;
}

// Diese Methode zählt wie oft eine Genre in einer Liste vorkommt und gibt diese Anzahl zurück.
function countOccurences(list, value) {
  var count = 0;
  for (let i = 0; i < list.length; i++) {
      if (list[i] === value && value !== "Undefined" && value !== "undefined" && value !== undefined) {
          count++;
      }
  }
  return count;
}

// Diese Funktion gibt eine Liste aller Genres deren Songs geliket wurden (mit Doppelungen) zurück.
function getGenreList(swipedSongs) {
  var genreList = [];
  for (let i = 0; i < swipedSongs.length; i++) {
      genreList.push(swipedSongs[i].genre);
  }
  return genreList;
}

// Diese Methode gibt die vier am öftesten gelikten Genres zurück.
function getTopFourGenres(genres) {
  var topGenres = [];

  //Zuerst werden 4 leere GenreElemente erstellt (falls der Nutzer nooch nichts geswipt hat).
  for (let i = 0; i < Config.NUMBER_GENRES_SWIPERATE; i++) {
      let dummyGenre = new GenreElement("none");
      dummyGenre.setOccurences(0);
      topGenres[i] = dummyGenre;
  }

  // Iterieren über die Genreliste:
  for (let i = 0; i < genres.length; i++) {
      //Falls das Genre undefined ist, wird es nicht gezählt.
      if (genres[i].name === "Undefined" || genres[i].name === "undefined" || genres[i].name === undefined) {
          continue;
      }
      // Hier werden die Occurences in aufsteigender Reihenfolge sortiert:
      let currOcc = genres[i].occurences;
      if (currOcc > topGenres[3].occurences) {
          if (currOcc > topGenres[2].occurences) {
              if (currOcc > topGenres[1].occurences) {
                  if (currOcc > topGenres[0].occurences) {
                      topGenres[3] = topGenres[2];
                      topGenres[2] = topGenres[1];
                      topGenres[1] = topGenres[0];
                      topGenres[0] = genres[i];
                  } else {
                      topGenres[3] = topGenres[2];
                      topGenres[2] = topGenres[1];
                      topGenres[1] = genres[i];
                  }
              } else {
                  topGenres[3] = topGenres[2];
                  topGenres[2] = genres[i];
              }
          } else {
              topGenres[3] = genres[i];
          }
      }
  }

  return topGenres;
}

// Diese Funktion gibt den Index des Listenelements mit dem größsten Wert zurück.
function getIndexWithMaxValue(list) {
  var idx = 0;

  for (let i = 0; i < list.length; i++) {
      if (list[idx] < list[i]) {
          idx = i;
      }
  }

  return idx;
}

// Diese Funktion erstellt eine Liste in der gespeichert ist, wie oft verschiedene Listenelemente in der übergebenen Liste vorkommen.
function getOccList(list) {
  var occlist = [];

  for (let i = 0; i < list.length; i++) {
      occlist.push(countOccurences(list, list[i]));
  }

  return occlist;
}

// Diese Funktion gibt das am öftesten rechts geswipte Genre aus.
function getTopGenre(genreList) {
  var occlist, maxIdx;

  // Die occList speichert die Vorkommens-Häufigkeit für die versch. Genres.
  occlist = getOccList(genreList);

  // Das gibt den Index mit dem größten Value zurück.
  maxIdx = getIndexWithMaxValue(occlist);

  return genreList[maxIdx];
}

// Diese Funktion gibt die Zahl der Wörter in einem String zurück.
function getNumberOfWords(string){
    return string.split(" ").length;
}

// Entfernt das erste Wort eines Strings (Außer bei Hip hop).
function removeFirstWord(string){
    if (string === "Hip Hop" || string === "hip hop" || string === "Hip hop"){
        return string;
    }
    let editedString = string,
        stringParts;
    if(editedString !== undefined){
        if(getNumberOfWords(editedString) > 1){
            stringParts = editedString.split(" ");
            editedString = "";
            for(let i = 1; i < stringParts.length; i++){
                editedString += stringParts[i];
                editedString += " ";
            }
            editedString = editedString.slice(0, -1);
        }
    }
    return editedString;
}

// Ersten Buchstabe eines Songs groß schreiben:
function makeFirstLetterUpperCase(string){
    let editedString = string;
    if(string !== undefined && string !== "undefined" && string !== null){
        let firstLetter = string.charAt(0);
        firstLetter = firstLetter.toUpperCase();

        editedString = string.substring(1);
        editedString = firstLetter + editedString;
    }
    return editedString;
}

// Diese Funktion gibt eine zufällige Zahl zwischen min und max zurück.
function getRandomNumber(min, max){
    return Math.floor(Math.random() * (max-min)) + min;
}

// Diese Funktion gibt einen zufälligen Searchrequest bestehend aus 2 zufälligen Buchenstaben zurück.
function getRandomSearchRequest(){
    var randomIdx1 = getRandomNumber(0, Config.ALL_LETTERS.length),
        randomIdx2 = getRandomNumber(0, Config.ALL_LETTERS.length),
        randomRequest = Config.ALL_LETTERS[randomIdx1] + Config.ALL_LETTERS[randomIdx2];

    return randomRequest;
}

// Diese Funktion gibt einen Offset für die Suchanfrage zwischen 0 und 1000 zurück.
function getRandomOffset(){
    return getRandomNumber(0, Config.MAX_RANDOM_NUMBER);
}

// Diese Funktion gibt den Index eines Songs in einer Song-Liste oder -1 zurück.
function getIndexOfSongInList(song, list){
    for(let i = 0; i < list.length; i++){
        if(list[i].id === song.id){
            return i;
        }
    }
    return -1;
}

// Gibt den Index des übergebenen Genres in der übergebenen Liste oder -1 zurück.
function findGenreInList(genre, list){
    for(let i = 0; i < list.length; i++){
        if(list[i].name === genre){
            return i;
        }
    }
    return -1;
}

// Holt sich das Html als Text von der jeweiligen URL mit fetch.
async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

// Diese Methode fügt die Swipe-Funktionalität hinzu. 
// Vergleiche: https://hammerjs.github.io/ und https://hammerjs.github.io/getting-started/ und https://codepen.io/RobVermeer/pen/japZpY
function hammerFunction(dislikeFunction, likeFunction, deleteFunction) {
    var newCards = document.querySelectorAll(".tinder--card:not(.removed)"),
        el = newCards[0],
        hammertime = new Hammer(el);

    //Hier wird der Card die Klasse "moving" hinzu, wenn man die Karte swipt
    hammertime.on("pan", function () {
        el.classList.add("moving");
    });

    //Hier wird die Swipe-Funktion hinzugefügt und die Card entsprechend animiert.
    hammertime.on("pan", function (event) {
        //deltaX ist wie weit der Nutzer horizontal swipt
        if (event.deltaX === 0) {return;}
        if (event.center.x === 0 && event.center.y === 0) {return;}

        //Ausrechnen der Bewegung
        let xMulti = event.deltaX * Config.MOVEMENT_X_VALUE,
            yMulti = event.deltaY / Config.MOVEMENT_Y_VALUE,
            rotate = xMulti * yMulti;

        //Hier wird die card animiert
        event.target.style.transform = "translate(" + event.deltaX + "px, " +
        event.deltaY + "px) rotate(" + rotate + "deg)";
    });

    //Hier wird implementiert, was passiert wenn der Nutzer den Finger nach dem swipen hebt
    hammertime.on("panend", function (event) {
        //Zuerst wird für die Animation ausgerechnet, was der Rand der App ist
        var moveOutWidth = document.body.clientWidth,
        keep = Math.abs(event.deltaX) < Config.Y_VALUE || Math.abs(event.velocityX) < Config.X_VALUE;

        //Danach wird die "moving" Klasse aus der card entfernt 
        //Je nachdem ob der Nutzer die card weit/fest genug geswipt hat, wird der card die Klasse "removed" hinzugefügt
        event.target.classList.remove("moving");
        event.target.classList.toggle("removed", !keep);

        if (keep) {
            event.target.style.transform = "";
        } else {
        //Hier werden die Positionen ausgerechnet, wo die Karte hin animiert wird
        let endX = Math.max(Math.abs(event.velocityX) * moveOutWidth,
            moveOutWidth),
            toX = event.deltaX > 0 ? endX : -endX,
            endY = Math.abs(event.velocityY) * moveOutWidth,
            toY = event.deltaY > 0 ? endY : -endY,
            xMulti = event.deltaX * Config.MOVEMENT_X_VALUE,
            yMulti = event.deltaY / Config.MOVEMENT_Y_VALUE,
            rotate = xMulti * yMulti;

        //Hier wird die Animation ausgeführt
        event.target.style.transform = "translate(" + toX + "px, " + (toY +
            event.deltaY) + "px) rotate(" + rotate + "deg)";

        if (event.deltaX < Config.POSITION_DISLIKE_VALUE && !keep) {
            //Wenn der Benutzer nach links swipt, wird die Karte entfernt und nicht zur Playlist hinzugefügt
            dislikeFunction();
            deleteFunction(event.target);
        }
        if (event.deltaX > Config.POSITION_LIKE_VALUE && !keep) {
            //Wenn der Benutzer nach recht swipt, wird die Karte entfernt, aber zur Playlist hinzugefügt
            likeFunction();
            deleteFunction(event.target);
        }
        }
    });
}

// Definiert wie die Songs nach dem Titel sortiert werden sollen (nach Alphabet).
function titleDecisionFunction(song1, song2){
    var song1Title = song1.title,
        song2Title = song2.title;
    
    if(song1Title < song2Title){
        return 1;
    }
    if(song1Title > song2Title){
        return -1;
    }

    return 0;
}

// Definiert wie die Songs nach zuletzt geswiped sortiert werden sollen (nach Timestamps).
function lastSwipedDecisionFunction(song1, song2) {
    var song1Time = song1.timeSwiped,
        song2Time = song2.timeSwiped;

    if(song1Time < song2Time){
        return -1;
    }
    if(song1Time > song2Time){
        return 1;
    }

    return 0;
}

// Definiert wie die Songs nach dem Interpret sortiert werden sollen (nach Alphabet).
function interpretDecisionFunction(song1, song2){
    var song1Interpret = song1.artist,
        song2Interpret = song2.artist;

    if(song1Interpret < song2Interpret){
        return 1;
    }
    if(song1Interpret > song2Interpret){
        return -1;
    }
    
    return 0;
}

// Definiert wie die Songs nach dem Genre sortiert werden sollen (nach Alphabet).
function genreDecisionFunction(song1, song2){
    var song1Genre = song1.genre,
        song2Genre = song2.genre;

    if(song1Genre === song2Genre){
        return 0;
    }
    
    if(song1Genre === "undefined" || song1Genre === undefined){
        return -1;
    }
    if(song2Genre === "undefined" || song2Genre === undefined){
        return 1;
    }

    if(song1Genre < song2Genre){
        return 1;
    }
    if(song1Genre > song2Genre){
        return -1;
    }
    
    return 0;
}

// Definiert wie die Songs nach ihrer Playlist sortiert werden sollen (nach Alphabet).
function playlistDecisionFunction(song1, song2){
    var song1Playlist = song1.playlist,
        song2Playlist = song2.playlist;

    if(song1Playlist < song2Playlist){
        return 1;
    }
    if(song1Playlist > song2Playlist){
        return -1;
    }
    
    return 0;
}

// Entfernt den Song der mit der übergebenen id korrespondiert aus der übergebenen Liste von Songs.
function removeSongWithId(id, list, saveFunction) {
    if(id === -1){
        return;
    }
    list.splice(id, 1);
    saveFunction(list);
}

// Diese Funktion gibt die aktuelle Bildschirmbreite zurück.
function getWidth() {
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return width;
}

function removeSongFromList(song, list) {
    var idx = getIndexOfSongInList(song, list);

    if(idx === -1) {
        return;
    }
    
    list.splice(idx, 1);
}

export {
    replaceWithDots, shorten, countOccurences, getGenreList, getTopFourGenres, getOccList, getIndexWithMaxValue, getTopGenre, getIndexOfSongInList, findGenreInList, fetchHtmlAsText,
    getRandomSearchRequest, getRandomOffset, getRandomNumber, getNumberOfWords, removeFirstWord, makeFirstLetterUpperCase, hammerFunction, playlistDecisionFunction, genreDecisionFunction,
    interpretDecisionFunction, lastSwipedDecisionFunction, titleDecisionFunction, removeSongWithId, getWidth, removeSongFromList,
};