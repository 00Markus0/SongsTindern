/* eslint-env browser */

import Config from "./Config.js";
import { Event } from "./Observer.js";

// Alle Event Klassen:

// Event wird ausgelöst, wenn ein Song geliked wird
class SongLikeEvent extends Event {
    constructor(curr) {
        super(Config.LIKE_EVENT, curr);
    }
}

// Event wird ausgelöst, wenn ein Song gedisliked wird
class SongDislikeEvent extends Event {
    constructor(curr) {
        super(Config.DISLIKE_EVENT, curr);
    }
}

// Event wird ausgelöst, wenn Song-Details angezeigt werden sollen oder nicht (show ist ein boolean wert)
class SongDetailsChangedEvent extends Event {
    constructor(show) {
        super(Config.SONG_DETAILS_SHOW_CHANGED_KEY, show);
    }
}

// Event wird ausgelöst, wenn die Anzahl der Skips verändert wurde (aufgrund der Änderung des GameModes)
class SkipAmountChangedEvent extends Event {
    constructor(skipAmount) {
        super(Config.SKIP_AMOUNT_CHANGED_KEY, skipAmount);
    }
}

// Event wird ausgelöst, wenn die Countdown-Zeit abgelaufen ist -> der Song soll automatisch gedislikt werden
class RejectSongEvent extends Event {
    constructor() {
        super(Config.REJECT_SONG_KEY, null);
    }
}

// Event setzt den jeweiligen GameMode beim start des Song-Tinderns
class GameModeChangedEvent extends Event {
    constructor(mode) {
        super(Config.EVENT_SPEED_MODE_SETTING_KEY, mode);
    }
}

// Event wird ausgelöst, wenn der Player einen Song abspielt
class PlayerIsPlayingSongEvent extends Event {
    constructor() {
      super(Config.EVENT_SONG_AUDIO_LOADED_KEY, null);
    }
}

//Event wird ausgelöst, wenn der Song geladen ist
class SongReadyEvent extends Event{

    constructor(song){
        super(Config.SONG_SHOWABLE_EVENT, song);
    }
}

// Event wird ausgelöst, wenn der Countdown abläuft
class CountdownUpEvent extends Event {
    constructor() {
        super(Config.COUNTDOWN_UP_KEY, null);
    }
}

// Event wird ausgelöst, wenn das Song HtmlTemplate geladen wurde
class playlistSelectionSongTemplateEvent extends Event {
    constructor(htmlTemplate){
        super(Config.PLAYLIST_SELECTION_SONG_TEMPLATE_READY_EVENT, htmlTemplate);
    }
}

// Event wird ausgelöst, wenn das Playlist HtmlTemplate geladen wurde
class playlistSelectionPlaylistTemplateEvent extends Event {
    constructor (htmlTemplate) {
        super(Config.PLAYLIST_SELECTION_PLAYLIST_TEMPLATE_READY_EVENT, htmlTemplate);
    }
}

// Event wird ausgelöst, wenn das Song-tinder card HtmlTemplate geladen wurde
class tinderTemplateReadyEvent extends Event {
    constructor (htmlTemplate) {
        super(Config.TINDER_CARD_TEMPLATE_READY, htmlTemplate);
    }
}

// Event wird ausgelöst, wenn das History widget HtmlTemplate geladen wurde
class historyTemplateReadyEvent extends Event {
    constructor (htmlTemplate) {
        super(Config.HISTORY_CARD_TEMPLATE_READY, htmlTemplate);
    }
}

// Event wird ausgelöst, wenn die Iconbar geladen wurde
class IconBarReadyEvent extends Event{
    constructor(){
        super(Config.ADDED_ICON_BAR, null);
    }
}

// Event wird ausgelöst, wenn das HistoryView geladen wurde.
class HistoryViewReadyEvent extends Event{
    constructor(){
        super(Config.CHANGED_TO_HISTORY_VIEW, null);
    }
}

// Event wird ausgelöst, wenn das SwipeView geladen wurde.
class SwipeViewReadyEvent extends Event{
    constructor(){
        super(Config.CHANGED_TO_SWIPE_VIEW, null);
    }
}

// Event wird ausgelöst, wenn das StatisticsView geladen wurde.
class StatisticsViewReadyEvent extends Event{
    constructor(){
        super(Config.CHANGED_TO_STATISTICS_VIEW, null);
    }
}

// Event wird ausgelöst, wenn das StartView geladen wurde.
class StartViewReadyEvent extends Event{
    constructor(){
        super(Config.CHANGED_TO_START_VIEW, null);
    }
}

// Event wird ausgelöst, wenn das SettingsView geladen wurde.
class SettingsSpeedReadyEvent extends Event{
    constructor(){
        super(Config.CHANGED_TO_SETTINGS_SPEED, null);
    }
}

// Event wird ausgelöst, wenn das SettingsDetailsView geladen wurde.
class SettingsDetailsReadyEvent extends Event {
    constructor() {
        super(Config.CHANGED_TO_SETTINGS_DETAILS, null);
    }
}

// Event wird ausgelöst, wenn das PlaylistSelectionView geladen wurde.
class PlaylistSelectionReadyEvent extends Event {
    constructor() {
        super(Config.PLAYLIST_SELECTION_EVENT_KEY, null);
    }
}

// Event wird ausgelöst, wenn ein Song geswiped wurde.
class SongSwipedEvent extends Event {
    constructor() {
      super(Config.EVENT_SONG_SWIPED_KEY, null);
    }
  }
  
// Event wird ausgelöst, wenn der User die Swipe runde beendet.
class SwipingEndEvent extends Event {
    constructor() {
        super(Config.EVENT_SONG_SWIPE_END, null);
    }
}

// Event wird ausgelöst, wenn ein Song von Spotify geladen wurde.
class SearchEvent extends Event{
    constructor(json){
    super(Config.SEARCH_CALLBACK_EVENT, json);
    }
}

// Event wird ausgelöst, wenn die Informationen zum Interpret geladen wurden.
class ArtistEvent extends Event{
    constructor(json){
        super(Config.ARTIST_INFO_EVENT, json);
    }
}

// Event wird ausgelöst, wenn die Informationen zum Song geladen wurden.
class DetailsEvent extends Event {
    constructor(json) {
        super(Config.SONG_DETAILS_EVENT, json);
    }
}

// Event wird ausgelöst, wenn ein Song abgespielt wird.
class SongPlayingEvent extends Event {
    constructor() {
      super(Config.EVENT_SONG_PLAYING_KEY, null);
    }
}

export {
    SongDetailsChangedEvent, SkipAmountChangedEvent, RejectSongEvent, GameModeChangedEvent, PlayerIsPlayingSongEvent, SongReadyEvent,
    CountdownUpEvent, playlistSelectionPlaylistTemplateEvent, playlistSelectionSongTemplateEvent, tinderTemplateReadyEvent,
    historyTemplateReadyEvent, IconBarReadyEvent, HistoryViewReadyEvent, SwipeViewReadyEvent, StatisticsViewReadyEvent, StartViewReadyEvent, SettingsSpeedReadyEvent, SettingsDetailsReadyEvent,
    PlaylistSelectionReadyEvent, SongSwipedEvent, SwipingEndEvent, SearchEvent, ArtistEvent, DetailsEvent, SongPlayingEvent, SongLikeEvent, SongDislikeEvent,
};