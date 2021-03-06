/*!
 * virtual-dom-component
 * https://github.com/alexmingoia/virtual-dom-component
 *
 * Copyright (c) 2014 Alex Mingoia <talk@alexmingoia.com>
 * Licensed under the BSD license.
 */

var Event = require('geval/single');

module.exports = VirtualComponent;

/**
 * Create a new virtual DOM component.
 *
 * A component takes some initialization arguments and returns
 * { events, state, render }.
 *
 * @return {VirtualComponent}
 * @api public
 */

function VirtualComponent () {
  if (this.initialize) {
    this.initialize.apply(this, arguments);
  }

  // create geval single events from array of event names
  // `['login']` becomes `events.login(listener|value)`
  if (this.events instanceof Array) {
    var events = {};
    for (var i=0, l=this.events.length; i<l; i++) {
      var ev = this.events[i];
      events[ev] = Event();
    }
    this.events = events;
  } else {
    this.events = this.events || {};
  }

  // .initialize() cannot set state
  this.state  = {};
}

/**
 * Extend `VirtualComponent` with render and other methods.
 *
 * An `initialize` method will be called when a new component is created.
 *
 * @param {Object} prototype properties or methods to extend prototype
 * @param {Function} prototype.render receives state and returns virtual DOM
 * @param {Function} prototype.initialize called with constructor arguments
 * @param {Array} prototype.events transform into map of geval events
 * @return {VirtualComponent}
 * @api public
 */

VirtualComponent.extend = function (prototype) {
  var parent = this;
  var child;

  prototype = prototype || {};

  if (!this.prototype.render && !prototype.render) {
    throw new Error('VirtualComponents require a render function');
  }

  if (prototype.state) {
    throw new Error('.state is reserved for component state');
  }

  if (prototype.hasOwnProperty('constructor')) {
    child = prototype.constructor;
  } else {
    child = function component () {
      if (!(this instanceof child)) {
        var self = Object.create(child.prototype);
        child.apply(self, arguments);
        return self;
      }

      return parent.apply(this, arguments);
    };
  }

  child.extend = parent.extend;

  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  for (var prop in prototype) {
    if (prototype.hasOwnProperty(prop)) {
      child.prototype[prop] = prototype[prop];
    }
  }

  child.__super__ = parent.prototype;

  return child;
};
