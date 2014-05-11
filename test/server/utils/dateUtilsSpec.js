describe('date utils', function() {
  'use strict';
  var srcDir = './../../../src/';
  delete require.cache[require.resolve(srcDir + 'utils/dateUtils')];
  var dateUtils = require(srcDir + 'utils/dateUtils'),
    should = require('should');

  should.Assertion.add('midnight', function() {
    this.params = {
      operator: 'to be midnight'
    };

    var dateCopy = new Date(this.obj);
    dateCopy.setHours(0, 0, 0, 0);
    this.assert(this.obj.getTime() == dateCopy.getTime());
  }, true);

  describe('getMidnightBeforeToday', function() {
    it('should be midnight', function() {
      dateUtils.getMidnightBeforeToday().should.be.midnight;
    });

    it('should be todays date', function() {
      var midnight = dateUtils.getMidnightBeforeToday(),
        now = new Date();
      now.setHours(0, 0, 0, 0);
      midnight.setHours(0, 0, 0, 0);

      midnight.getTime().should.eql(now.getTime());
    });
  });

  describe('getMidnightAfterToday', function() {
    it('should be midnight', function() {
      dateUtils.getMidnightAfterToday().should.be.midnight;
    });

    it('should be tomorrows date', function() {
      var midnight = dateUtils.getMidnightAfterToday(),
        now = new Date(Date.now() + 24 * 60 * 60 * 1000);
      now.setHours(0, 0, 0, 0);
      midnight.setHours(0, 0, 0, 0);

      midnight.getTime().should.eql(now.getTime());
    });
  });
});
