/* eslint-env browser */

// Die Observer-Klasse merkt sich welche Objekte sich für welche Events interessieren und informiert diese dann.
class Observer {

    constructor() {
        this.listener = {};
    }

    addEventListener(type, callback) {
        if (this.listener[type] === undefined) {
            this.listener[type] = [];
        }
        this.listener[type].push(callback);
    }

    notifyAll(event) {
        if (this.listener[event.type] !== undefined) {
            for (let i = 0; i < this.listener[event.type].length; i++) {
                this.listener[event.type][i](event);
            }
        }
    }

}

// Ein Event-Objekt repräsentiert ein auftretendes Event für das sich mehrere Listener interessieren können.
class Event {

    constructor(type, data) {
        this.type = type;
        this.data = data;
        Object.freeze(this);
    }

}

export default Observer;
export {Observer, Event};