module.exports = (function() {
  'use strict';

  return {
    millisInDay: 24 * 60 * 60 * 1000,
    getMidnightBeforeToday: function() {
      var midnightBeforeToday = new Date();
      midnightBeforeToday.setHours(0, 0, 0, 0);
      return midnightBeforeToday;
    },
    getMidnightAfterToday: function() {
      var midnightBeforeToday = new Date(Date.now() + this.millisInDay);
      midnightBeforeToday.setHours(0, 0, 0, 0);
      return midnightBeforeToday;
    }
  };
})();
