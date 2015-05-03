(function() {
  'use strict';
  var module = angular.module('pubSub', []);

  /**
   * PubSub is a class that can be used to set up a pubsub (publish, subscribe)
   * kind of service.
   *
   * @constructor
   * @param {function(): Object} getter The function to call to get the current value
   * @param {function(Object)} setter The function to call to update the current value
   */
  function PubSub(getter, setter) {
    var subedCallbacks = [];
    var value = getter();

    function onChanged(callback) {
      subedCallbacks.push(callback);
    }
    function unsubscribe(callback) {
      var i = subedCallbacks.indexOf(callback);
      if (i != -1) {
        subedCallbacks.splice(i, 1);
      }
    }
    /**
     * @callback stateChangeCallback
     * @param {Object} value The new value
     */

    /**
     * Registers the callback to be called whenever the value changes.
     * Also adds a listener for the $scope's $destroy event to unregister the
     * callback when the $scope is discarded.
     *
     * @param {Scope}   $scope
     * @param {stateChangeCallback} callback
     */
    this.subscribeToChanges = function($scope, callback) {
      onChanged(callback);
      $scope.$on('$destroy', function() {
        unsubscribe(callback);
      });
    };
    this.getCurrent = function() {
      return value;
    };
    this.update = function(_value_) {
      value = _value_;
      setter(value);
      subedCallbacks.forEach(function(callback) {
        callback(value);
      });
    };
  }

  module.constant('PubSub', PubSub);
})();
