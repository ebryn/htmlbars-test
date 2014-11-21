import Ember from "ember";

var IS_BINDING = Ember.IS_BINDING;
var bind = Ember.bind;
var get = Ember.get;
var KeyStream = Ember.KeyStream;
var ContextStream = Ember.ContextStream;

function makeCtor() {
  var Class = function(props) {
    this.init(props);
  };

  Class.isViewClass = true;
  Class._debugContainerKey = "";
  Class._toString = "";
  Class.container = null;

  Class.extend = function(props) {
    Ember.merge(this, props);
    return this;
  };

  Class.reopenClass = function(props) {
    Ember.merge(this, props);
    return this;
  };

  Class.create = function(props) {
    return new MetalView(props);
  }

  return Class;
}

var MetalView = makeCtor();

MetalView.prototype = {
  init: function(props) {
    this._childViews = [];
    this._keywords = {};
    this._baseContext = undefined;
    this._contextStream = undefined;

    for (var key in props) {
      if (!props.hasOwnProperty(key)) { continue; }
      if (IS_BINDING.test(key)) {
        bind(this, key.slice(0, -7), props[key]);
      } else {
        this[key] = props[key];
      }
    }

    if (!this.tagName) { this.tagName = 'div'; }
  },

  render: function (buffer) {
    Ember.View.prototype.render.call(this, buffer);
  },

  getStream: function(path) {
    return this._getContextStream().get(path);
  },

  _getContextStream: function() {
    if (this._contextStream === undefined) {
      this._baseContext = new KeyStream(this, 'context');
      this._contextStream = new ContextStream(this);
      // this.one('willDestroyElement', this, this._destroyContextStream);
    }

    return this._contextStream;
  },

  createChildView: function(childView, attrs) {
    return Ember.View.prototype.createChildView.call(this, childView, attrs);
  },

  appendChild: function(childView, options) {
    var view = this;
    var buffer = view.buffer;
    var _childViews = view._childViews;

    childView = view.createChildView(childView, options);
    if (!_childViews.length) { _childViews = view._childViews = _childViews.slice(); }
    _childViews.push(childView);

    if (!childView._morph) {
      buffer.pushChildView(childView);
    }

    // view.propertyDidChange('childViews');

    return childView;
  },

  _wrapAsScheduled: function(fn) {
    var view = this;
    var stateCheckedFn = function() {
      view.currentState.invokeObserver(this, fn);
    };
    var scheduledFn = function() {
      run.scheduleOnce('render', this, stateCheckedFn);
    };
    return scheduledFn;
  },

  removeChild: function(childView) {
    Ember.View.prototype.removeChild.call(this, childView);
  },

  propertyDidChange: function() {

  },

  destroy: function() {

  }
};

export default MetalView;