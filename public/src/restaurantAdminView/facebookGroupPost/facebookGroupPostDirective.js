(function() {
  'use strict';
  var module = angular.module('facebookGroupPostDirective', [
    'ngResource',
  ]);

  module.directive('facebookGroupPost', ['$resource',
    function($resource) {
      return {
        scope: {
          submitFunction: '&onSubmit',
          cancelFunction: '&onCancel',
          defaultTemplate: '=',
          date: '=',
        },
        controllerAs: 'ctrl',
        bindToController: true,
        controller: [function() {
          var ctrl = this;
          ctrl.post = $resource('api/v1/restaurant/posts/:date', {
            date: '@date',
          }, {
            save: {
              url: 'api/v1/restaurant/posts',
              method: 'POST',
            },
            update: {
              method: 'PUT',
            },
          }).get({
            date: ctrl.date,
          }, function success(value, responseHeaders) {
          }, function error(httpResponse) {
            if (httpResponse.status !== 404) {
              ctrl.error = httpResponse.data;
              return;
            }
            ctrl.post.date = ctrl.date;
            ctrl.post.message_template = ctrl.defaultTemplate;
          });
          ctrl.submit = function() {
            if (!!ctrl.post._id) {
              ctrl.post.$update({}, function success() {
              }, function error(httpResponse) {
                ctrl.error = httpResponse.data;
              });
            } else {
              ctrl.post.$save({}, function success() {
              }, function error(httpResponse) {
                ctrl.error = httpResponse.data;
              });
            }
          };
        }],
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/facebookGroupPost/facebookGroupPost.html'
      };
    }
  ]);
})();
