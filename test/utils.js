var utils = (function (){
  'use strict';

  // jasmine matcher for expecting an element to have a css class
  // https://github.com/angular/angular.js/blob/master/test/matchers.js
  beforeEach(function() {
    jasmine.addMatchers({
      toHaveClass: function(util, customEqualityTesters) {
        return {
          compare: function (actual, expected){
            var result = {};

            result.pass = actual.hasClass(expected);

            var actualDump = angular.mock.dump(actual);
            var notText = result.pass ? ' not' : '';
            result.message = 'Expected "' + actualDump + '" '+ notText + ' to have class "' + expected + '".';
            return result;
          }
        };
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
    },
    compile: function(html){
      var element, scope, parentScope;
      inject(function ($compile, $rootScope, $timeout){
        parentScope = $rootScope.$new();
        element = angular.element(html);
        $compile(element)(parentScope);
        $timeout(function (){
          scope = element.isolateScope();
          parentScope.$digest();
        });
        $timeout.flush();
      });

      return {
        element: element,
        scope: scope,
        parentScope: parentScope
      }
    }
  };
})();
