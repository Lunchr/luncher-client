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
              params: {
                date: undefined,
              },
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
            ctrl.submitPending = true;
            var promise = (function() {
              if (!!ctrl.post._id) {
                return ctrl.post.$update({});
              } else {
                return ctrl.post.$save({});
              }
            })();
            promise.then(function success() {
            }, function error(httpResponse) {
                ctrl.error = httpResponse.data;
            }).finally(function() {
                ctrl.submitPending = false;
            });
          };
        }],
        restrict: 'E',
        templateUrl: 'src/restaurantAdminView/facebookGroupPost/facebookGroupPost.html'
      };
    }
  ]);
})();
