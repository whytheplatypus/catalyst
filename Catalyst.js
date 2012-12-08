//something the causes events :P

"use strict";

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module.
      define([], factory);
    } else {
        // Browser globals
        root.Catalyst = factory();
    }
}(this, function () {
/**
 * Attach event handlers to the objects
 * @param {Object} obj The object to become an event listener
 */
  function Catalyst(obj){
    obj = obj.prototype===undefined?obj:obj.prototype;
    /**
     * A hash of the events and their listeners for the object
     * @type {Object}
     */
    obj.events = {};
    //need a jsdoc snippet
    /**
     * Add a listener for an even on the object
     * @param  {String}   type     The name of the event
     * @param  {Function} callback The function to be called on the event
     * @return {Object}            A hash of the name and id for the regestered event
     */
    obj.on = function(type, callback) {
      function size(obj) {
          var size = 0, key;
          for (key in obj) {
              if (obj.hasOwnProperty(key)) size++;
          }
          return size;
      };
      if(this.events[type] === undefined){
        this.events[type] = {};
      }
      var id = type+size(this.events[type]);
      this.events[type][id] = callback;
      return {type:type, id:id};
    };
    //what this to work over workers if needed...
    /**
     * Trigger the event
     * @param  {String} event The event to trigger
     */
    obj.trigger = function(event) {
      if(typeof event === "string"){
        for(var key in this.events[event]){
          this.events[event][key](this);//do I have to do anything about self vs this?
        }
      } else if(event instanceof Object){
        for(var key in this.events[event.type]){
          this.events[event.type][key](event);//do I have to do anything about self vs this?
        }
      } else {
          throw "Couldn't trigger "+event;
      }
    };

    /**
     * Remove the event
     * @param  {Object} listener The regestered listener object gotten from ```on```
     */
    obj.remove = function(listener) {
      this.events[listener.type][listener.id] = null;
      delete this.events[listener.type][listener.id];
    };

    //adapted from https://github.com/melanke/Watch.JS
    function watchSetter(obj, propName){
      var oldValue = obj[propName];
      var set = function(newValue){
        obj.trigger({type:'change:'+propName, old:oldValue, new:newValue});
        oldValue = newValue;
      }
      try {
        Object.defineProperty(obj, propName, {
                set: set,
                enumerable: true,
                configurable: true
        });
      } catch(error) {
        try{
            //Object.prototype.__defineGetter__.call(obj, propName, get);
            Object.prototype.__defineSetter__.call(obj, propName, set);
        }catch(error2){
            throw "watchJS error: browser not supported :/"
        }
      }
    }

    function unwatchSetter(obj, propName){
      try {
        Object.defineProperty(obj, propName, {
          get: function(){return obj[propName];},
          set: function(val){obj[propName]=val;},
          enumerable: true,
          configurable: true
        });
      } catch(error) {
        try{
            //Object.prototype.__defineGetter__.call(obj, propName, get);
            Object.prototype.__defineSetter__.call(obj, propName, function(val){obj[propName]=val;});
        }catch(error2){
            throw "watchJS error: browser not supported :/"
        }
      }
    }

    /**
     * Watch a given property
     * @param  {String} prop The name of the property to watch
     */
    obj.watch = function(prop){
      watchSetter(this, prop);
    };

    /**
     * Stop watching the given property
     * @param  {String} prop The name fo the property
     */
    obj.unwatch = function(prop){
      //remove all the listeners?
      this.events['change:'+prop] = null;
      delete this.events['change:'+prop];
      unwatchSetter(this, prop);
    };
  };

  return Catalyst;
}));