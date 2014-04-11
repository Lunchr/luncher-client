var utils = (function (){
  'use strict';

  // jasmine matcher for expecting an element to have a css class
  // https://github.com/angular/angular.js/blob/master/test/matchers.js
  beforeEach(function() {
    this.addMatchers({
      toHaveClass: function(cls) {
        var actualDump = angular.mock.dump(this.actual);
        var notText = this.isNot ? ' not' : '';
        this.message = function() {
          return 'Expected "' + actualDump + '" '+ notText + ' to have class "' + cls + '".';
        };

        return this.actual.hasClass(cls);
      }
    });
  });

  return {
    pruneObject: function (obj){
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)){
          delete obj[prop];
        }
      }
    }
  };
})();
