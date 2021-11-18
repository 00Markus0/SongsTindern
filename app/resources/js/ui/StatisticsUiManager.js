/* eslint-env browser */
/* eslint no-undef: 0 */ // Implementirerungen dieser Art von der chart.js Library vorgegeben
/* eslint no-unused-vars: 0*/ // Implementierungen dieser Art von der chart.js Library vorgegeben
import Config from "../utils/Config.js";
import { getGenreList, getTopFourGenres, getTopGenre} from "../utils/HelperFunctions.js";

//Variablen für StatisticsView
var storageManager, // Ein StorageManager-Objekt, dass den Zugriff auf den Anwendungsspeicher kapselt.
    observer, // Ein Observer, der die Kommunikation mit der restlichen Anwendung erlaubt.
    leftRightChart, //Chart der die insgesamten Swipes nach links und rechts im Vergleich anzeigt.
    genreSwipeRateChart, //  Bar chart der die Swipe Rate der ersten 4 meist geswipten Genres anzeigt.
    acousticElectronicChart, //Chart der die Accousticness und Electronicness Werte der gelikten Songs im Vergleich anzeigt.
    instrumentalVocalChart; //Chart der die Instruemntalness und vocal Werte der gelikten Songs im Vergleich anzeigt.

//Diese Methode initalisiert den Danceability-Wert.
function initDanceability() {
    let danceability = calculateDanceabilityValue();
    setDanceabilityImage(danceability);
    setDancabilityValueUI(danceability);
}

//Erst wird über alle gelikten Songs iteriert, Dann wird die Danceability von jedem Song gespeichert.
//Danach, wenn man Songs geswipt hat, wird die Danceability ausgerechnet und gerundet.
function calculateDanceabilityValue(){
    var likedSongs = storageManager.swipedSongsList,
        temporarySongCounter = 0,
        danceability = 0;
    
    for (let i = 0; i < likedSongs.length; i++) {
        if (likedSongs[i].isDuplicate) {
            continue;
        }
        danceability += likedSongs[i].danceability;
        temporarySongCounter++;
    }

    if (temporarySongCounter !== 0) {
        danceability = danceability / temporarySongCounter;
    }

    return Math.floor(danceability * Config.ROUNDING_VALUE_HUNDRED) / Config.ROUNDING_VALUE_HUNDRED;
}

// Diese Methode initialisiert die Anzahl aller geswipten Songs im UI.
function initSongCount() {
    var count = storageManager.songCount,
        countEl = document.querySelector("#song-count");
    countEl.innerHTML = count;
}

// Diese Methode ändert das Favortie-Genre im UI.
function initFavGenre() {
    var allSwipedSongs = storageManager.swipedSongsList,
        genreList, topGenre,
        favoriteGenreEl = document.querySelector("#favorite-genre");
    if (allSwipedSongs !== null && allSwipedSongs !== undefined && allSwipedSongs.length !== 0) {
        genreList = getGenreList(allSwipedSongs);

        topGenre = getTopGenre(genreList);

        favoriteGenreEl.innerHTML = topGenre;
    }
}

// Diese Methode initalisiert den like/dislike Donut-Chart.
function initLeftRightDoughnutChart() {
    var canvas,
        config,
        dataset,
        likes = storageManager.likeCounter,
        dislikes = storageManager.dislikeCounter;

    // Falls Likes und Dislikes beide = 0 sind verschwindet der Donut, daher werden in diesem Fall beide auf 0.5 gesetzt.
    if (storageManager.songCount === 0) {
        likes = Config.DOUGHNUT_CHART_DEFAULT_VALUE;
        dislikes = Config.DOUGHNUT_CHART_DEFAULT_VALUE;
    }

    canvas = document.querySelector("#left-right-doughnut");

    // Im dataset-Objekt werden die Daten für die Teile des Donusts und die korrespondierenden Attribute, die das Aussehen bestimmen übergeben.
    dataset = Config.LEFT_RIGHT_DATASET;
    dataset.data = [likes, dislikes];

    // Das Config-Objekt bestimmt das Aussehen des Diagrams.
    config = JSON.parse(JSON.stringify(Config.DONUT_CHART_CONFIG));
    config.data.labels = ["right", "left"];
    config.data.datasets = [dataset];
    config.options.legend.onClick = (e) => e.stopPropagation();

    // Falls schon ein Donut erzeugt wurde, werden nur die Daten aktualisiert, sonst wird ein neues Diagramm erzeugt.
    // Wird immer ein neues Diagramm erzeugt, Springen die Diagramme beim hovern.
    leftRightChart = new Chart(canvas, config);
}

//Diese Methode erstellt das Donut-Diagramm für Acoustic / electronic - Werte.
function initAcousticElectronicDoughnutChart() {
    var ctx,
        config,
        dataset,
        acousticness = 0,
        electronicness = 0,
        values;

    values = calculateAcousticElectronicValues();
    acousticness = values.acoustic;
    electronicness = values.electronic;
    
    ctx = document.querySelector("#akustic-electronic-doughnut");

    // Im dataset-Objekt werden die Daten für die Teile des Donusts und die korrespondierenden Attribute, die das Aussehen bestimmen übergeben.
    dataset = Config.ACOUSTIC_ELECTRONIC_DATASET;
    dataset.data = [Math.floor(electronicness * Config.ROUNDING_VALUE_HUNDRED) / Config.ROUNDING_VALUE_HUNDRED, 
        Math.floor(acousticness * Config.ROUNDING_VALUE_HUNDRED) / Config.ROUNDING_VALUE_HUNDRED];

    // Das Config-Objekt bestimmt das Aussehen des Diagrams.
    config = JSON.parse(JSON.stringify(Config.DONUT_CHART_CONFIG));
    config.data.labels = ["acoustic", "electronic"];
    config.data.datasets = [dataset];
    config.options.legend.onClick = (e) => e.stopPropagation();

    acousticElectronicChart = new Chart(ctx, config);
}

//Die acousticness und electroincness wird berechnet.
function calculateAcousticElectronicValues(){
    var acousticness = 0,
        electronicness = 0,
        likedSongs = storageManager.swipedSongsList,
        songCounter = 0,
        values;
    
    for (let i = 0; i < likedSongs.length; i++) {
        if (likedSongs[i].isDuplicate) {
            continue;
        }
        if (likedSongs[i].acousticness) {
            acousticness++;
        } else {
            electronicness++;
        }
        songCounter++;
    }
    if (songCounter !== 0) {
        acousticness = acousticness / songCounter;
        electronicness = electronicness / songCounter;
    } else {
        acousticness = Config.DOUGHNUT_CHART_DEFAULT_VALUE;
        electronicness = Config.DOUGHNUT_CHART_DEFAULT_VALUE;
    }

    values = {
        acoustic: acousticness,
        electronic: electronicness,
    };

    return values;
}

//Diese Methode erstellt das Donut-Diagramm für die Instrumental / vocal - Werte.
function initInstrumentalVocalDoughnutChart() {
    var ctx,
        config,
        dataset,
        vocal = 0,
        instrumentalness = 0,
        values;

    values = calculateInstrumentalVocalValues();
    vocal = values.vocalness;
    instrumentalness = values.instrumental;

    ctx = document.querySelector("#instrumental-vocal-doughnut");

    // Im dataset-Objekt werden die Daten für die Teile des Donusts und die korrespondierenden Attribute, die das Aussehen bestimmen übergeben.
    dataset = Config.INSTRUMENTAL_VOCAL_DATASET;
    dataset.data = [Math.floor(vocal * Config.ROUNDING_VALUE_HUNDRED) / Config.ROUNDING_VALUE_HUNDRED, 
        Math.floor(instrumentalness * Config.ROUNDING_VALUE_HUNDRED) / Config.ROUNDING_VALUE_HUNDRED];

    // Das Config-Objekt bestimmt das Aussehen des Diagrams.
    config = JSON.parse(JSON.stringify(Config.DONUT_CHART_CONFIG));
    config.data.labels = ["instrumental", "vocal"];
    config.data.datasets = [dataset];
    config.options.legend.onClick = (e) => e.stopPropagation();

    instrumentalVocalChart = new Chart(ctx, config);
}

//Berechnung der instrumentalness und des vocal-Wertes.
function calculateInstrumentalVocalValues(){
    var vocal = 0,
        instrumentalness = 0,
        likedSongs = storageManager.swipedSongsList,
        tempSongCounter = 0,
        values;
    //Zuerst wird über alle gelikten Songs iteriert.#akustic
    //Jeder Song hat ein "instrumentalness"-Attribut das einen boolean Wert hat.#akustic.
    //Wenn ein Song also "instrumentalness" true hat, ist er instrumental, ansonsten vocal.
    for (let i = 0; i < likedSongs.length; i++) {
        if (likedSongs[i].isDuplicate) {
            continue;
        }
        if (likedSongs[i].instrumentalness) {
            instrumentalness++;
        } else {
            vocal++;
        }
        tempSongCounter++;
    }
    //Wenn songs existieren, dann wird ausgerechnet in welchem Verhältnis vocal und instrumental steht.
    if (tempSongCounter !== 0) {
        instrumentalness = instrumentalness / tempSongCounter;
        vocal = vocal / tempSongCounter;
    } else {
        instrumentalness = Config.DOUGHNUT_CHART_DEFAULT_VALUE;
        vocal = Config.DOUGHNUT_CHART_DEFAULT_VALUE;
    }

    values = {
        instrumental: instrumentalness,
        vocalness: vocal,
    };

    return values;
}

// Beim Aufruf dieser Funktion wird ein Balkendiagramm erzeugt oder aktualisiert, dass das.#akustic
// Verhältnis der Likes und Dislikes bei den 4 am öftesten glikten Genres anzeigt.
function initGenreSwipeRateBarChart() {
    var ctx,
        config,
        dataset,
        topGenres = getTopFourGenres(storageManager.genreList); // Diese Liste enthält die 4 am öftesten nach rechts geswipten Genres.

    ctx = document.querySelector("#genre-swipe-rate");

    // Im dataset-Objekt werden die Daten für die Balken und die korrespondierenden Attribute, die das Aussehen der Balken bestimmen übergeben.
    dataset = Config.GENRE_BAR_CHART_DATASET;
    dataset.data = [topGenres[0].swipeRate, topGenres[1].swipeRate, topGenres[2].swipeRate, topGenres[3].swipeRate];

    // Das Config-Objekt bestimmt das Aussehen des Diagrams.
    config = Config.GENRE_BAR_CHART_CONFIG;
    config.data.labels = [topGenres[0].name, topGenres[1].name, topGenres[2].name, topGenres[3].name];
    config.data.datasets = [dataset];

    genreSwipeRateChart = new Chart(ctx, config);
}

//Diese Methode setzt den Danceability-Wert im UI.
function setDancabilityValueUI(danceability) {
    let danceAbilityMetric = document.getElementById("danceability-metric"),
    danceabilityRounded = danceability * Config.ROUNDING_VALUE_HUNDRED;
    danceabilityRounded = Math.round(danceabilityRounded);
    danceAbilityMetric.innerHTML = danceabilityRounded + "%";
}

//Diese Methode setzt das passende gif zu dem Danceability-Wert.
function setDanceabilityImage(danceability) {
    var danceImage = document.getElementById("dancer");

    if (danceability < Config.BARELY_MOVING_GIF_VALUE) {
        danceImage.src = Config.DANCE_IMAGE_0_2;
    } else if (danceability < Config.GANGNAM_STYLE_GIF_VALUE) {
        danceImage.src = Config.DANCE_IMAGE_0_5;
    } else if (danceability < Config.BREAKDANCE_GIF_GREEN_VALUE) {
        danceImage.src = Config.DANCE_IMAGE_0_75;
    } else if (danceability < Config.BREAKDANCE_GIF_BLUE_VALUE) {
        danceImage.src = Config.DANCE_IMAGE_0_9;
    } else {
        danceImage.src = Config.DANCE_IMAGE_1_0;
    }
}

class StatisticsUIManager {
    constructor(statisticsObserver, statisticsStorageManager) {
        observer = statisticsObserver;
        storageManager = statisticsStorageManager;
    }

    setListeners() {
        observer.addEventListener(Config.CHANGED_TO_STATISTICS_VIEW, this.init);
    }

    init() {
        //Werte
        initDanceability();
        initSongCount();
        initFavGenre();
        //Charts
        initLeftRightDoughnutChart();
        initAcousticElectronicDoughnutChart();
        initInstrumentalVocalDoughnutChart();
        initGenreSwipeRateBarChart();
    }
}

export default StatisticsUIManager;