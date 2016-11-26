'use strict';

((function() {
    window.EventHandler = function() {
        this.listeners = {};
        this.trigger = function() {
            var name = arguments[0];
            var scope = arguments[1] || null;
            var listeners = this.listeners[name] || [];
            for (var i = 0; i < listeners.length; i++) {
                Array.prototype.splice.call(arguments, 0, 2);
                var callback = this.listeners[name][i];
                callback.apply(scope, arguments);
            }
        };
        this.on = function(name, callback) {
            if (!this.listeners[name]) this.listeners[name] = [];
            this.listeners[name].push(callback);
        };
        this.off = function(name) {
            delete this.listeners[name];
        };
        this.off = function(name, callback) {
            if (this.listeners[name]) {
                var array = this.listeners[name];
                if (array.indexOf(callback) > -1) array.splice(index, 1);
            }
        };
    };
})());
