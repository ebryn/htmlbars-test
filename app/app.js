import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

var onBegin = Ember.run.backburner.options.onBegin;
var onEnd = Ember.run.backburner.options.onEnd;
var runloopStartTimes = [];

Ember.run.backburner.options.onBegin = function() {
  runloopStartTimes.push(+new Date);
  onBegin.apply(this, arguments);
};
Ember.run.backburner.options.onEnd = function() {
  onEnd.apply(this, arguments);
  var startTime = runloopStartTimes.pop(),
      now = +new Date(),
      diff = now - startTime;

  if (diff < 2) { return; } // filter out runloops faster than 2ms

  console.log(Ember.VERSION + ' runloop: ' + diff.toFixed(2));
};

Ember.MODEL_FACTORY_INJECTIONS = true;

Ember.CoreView.reopenClass({
  detect: function(klass) {
    if (klass.isViewClass) { return true; }
    return this._super(klass);
  }
});

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
