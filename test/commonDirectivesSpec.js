describe('Common directives', function() {
  'use strict';
  beforeEach(module('commonDirectives', 'partials', 'mocks'));

  describe('millisUntilMidnight service', function (){
    var millisUntilMidnight;

    beforeEach(inject(function (_millisUntilMidnight_, timezonesJSON){
      millisUntilMidnight = _millisUntilMidnight_;

      var tz = timezoneJS.timezone;
      tz.loadingScheme = tz.loadingSchemes.MANUAL_LOAD;
      tz.loadZoneDataFromObject(timezonesJSON);
    }));

    it('should calculate time millisecnds left to midnight in Tallinn\'s timezone from the provided time', inject(function (){
      var aDate = new timezoneJS.Date(1397498021195, 'Europe/Tallinn');
      expect(millisUntilMidnight(aDate)).toBe(11178805);
    }));

    it('should calculate time millisecnds left to midnight in London\'s timezone from the provided time', inject(function (){
      var aDate = new timezoneJS.Date(1397498021195, 'Europe/London');
      expect(millisUntilMidnight(aDate)).toBe(18378805);
    }));
  });

  describe('MILLIS_IN_24H constant', function(){
    it('should be equal to millisecnds in a day', inject(function(MILLIS_IN_24H) {
      expect(MILLIS_IN_24H / 1000 / 60 / 60).toBe(24);
    }));
  });

  describe('date directive', function() {
    var element, scope, parentScope;
    beforeEach(function (){
      var compiled = utils.compile('<date/>');
      element = compiled.element;
      scope = compiled.scope;
      parentScope = compiled.parentScope;
    });

    it('should have a date object on scope', function (){
      expect(scope.date).toBeDefined();
      expect(scope.date instanceof Date).toBe(true);
    });

    it('should format the date', function (){
      scope.date = new Date(1397496910156);
      scope.$apply();
      expect(element.children().html()).toBe('Monday, April 14, 2014');
    });

    it('should update date after timeout flush', inject(function ($timeout){
      var currentDate = scope.date;

      $timeout.flush();

      expect(scope.date).not.toBe(currentDate);
    }));

    it('should not update date after timeout flush if element destroyed', inject(function ($timeout){
      var currentDate = scope.date;
      element.remove();

      $timeout.flush();

      expect(scope.date).not.toBe(currentDate);
    }));

    describe('with timeout flushed (i.e. after midnight)', function (){
      beforeEach(inject(function ($timeout){
        $timeout.flush();
      }));

      it('should update after 24 hours', inject(function ($interval, MILLIS_IN_24H){
        var currentDate = scope.date;

        $interval.flush(MILLIS_IN_24H);

        expect(scope.date).not.toBe(currentDate);
      }));

      it('should update after 24 hours, multiple times', inject(function ($interval, MILLIS_IN_24H){
        var currentDate = scope.date;
        $interval.flush(MILLIS_IN_24H);
        expect(scope.date).not.toBe(currentDate);

        currentDate = scope.date;
        $interval.flush(MILLIS_IN_24H);
        expect(scope.date).not.toBe(currentDate);
      }));

      it('should not update after less than 24 hours', inject(function ($interval, MILLIS_IN_24H){
        var currentDate = scope.date;

        $interval.flush(MILLIS_IN_24H - 100);

        expect(scope.date).toBe(currentDate);
      }));

      it('should not update if element destroyed', inject(function ($interval, MILLIS_IN_24H){
        var currentDate = scope.date;
        element.remove();

        $interval.flush(MILLIS_IN_24H);

        expect(scope.date).toBe(currentDate);
      }));
    });

  });
});
