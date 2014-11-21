import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var rows = [];
    for (var i = 0; i < 10000; i++) {
      rows.push({title: "Item #" + (i+1)});
    }

    return {rows: rows};
  }
});
