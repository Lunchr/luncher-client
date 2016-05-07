var utils = (function() {
  'use strict';

  // Polyfill bind for PhantomJS
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Polyfill
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          FNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof FNOP ?
                   this :
                   oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      if (this.prototype) {
        // Function.prototype doesn't have a prototype property
        FNOP.prototype = this.prototype;
      }
      fBound.prototype = new FNOP();

      return fBound;
    };
  }
  // Make sure PhantomJS has bind on console methods
  if (!console.log.bind) {
    console.log.bind = Function.prototype.bind;
    console.error.bind = Function.prototype.bind;
  }

  // jasmine matcher for expecting an element to have a css class
  // https://github.com/angular/angular.js/blob/master/test/matchers.js
  beforeEach(function() {
    jasmine.addMatchers({
      toHaveClass: function(util, customEqualityTesters) {
        return {
          compare: function(actual, expected) {
            var result = {};

            result.pass = actual.hasClass(expected);

            var actualDump = angular.mock.dump(actual);
            var notText = result.pass ? ' not' : '';
            result.message = 'Expected "' + actualDump + '" ' + notText + ' to have class "' + expected + '".';
            return result;
          }
        };
      }
    });
  });

  return {
    pruneObject: function(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          delete obj[prop];
        }
      }
    },
    compile: function(html, prepareParentFunction) {
      var element, scope, parentScope;
      inject(function($compile, $rootScope, $timeout) {
        parentScope = $rootScope.$new();
        if (prepareParentFunction) {
          parentScope.$apply(function() {
            prepareParentFunction(parentScope);
          });
        }
        element = angular.element(html);
        $compile(element)(parentScope);
        $timeout(function() {
          scope = element.isolateScope();
          parentScope.$digest();
        });
        $timeout.flush();
      });

      return {
        element: element,
        scope: scope,
        parentScope: parentScope
      };
    }
  };
})();
