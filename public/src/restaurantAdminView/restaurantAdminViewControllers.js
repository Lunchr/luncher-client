(function() {
  'use strict';
  var module = angular.module('restaurantAdminViewControllers', [
    'ngResource',
  ]);
  var offerPostedEventChannel = 'offer-posted';
  var offerUpdateOperation = {
    method: 'PUT',
    url: 'api/v1/offers/:id',
    params: {
      id: '@_id'
    },
  };
  var offerDeleteOperation = {
    method: 'DELETE',
    url: 'api/v1/offers/:id',
    params: {
      id: '@_id'
    },
  };

  module.controller('RestaurantAdminViewCtrl', ['$scope', '$resource', 'restaurant',
    function($scope, $resource, restaurant) {
      var vm = this;
      vm.restaurant = restaurant;
      vm.postOffer = function(offer) {
        offer.restaurant = vm.restaurant;
        var postedOffer = $resource('api/v1/offers', {}, {
          update: offerUpdateOperation,
          delete: offerDeleteOperation,
        }).save(offer);
        $scope.$broadcast(offerPostedEventChannel, postedOffer);
      };
    }
  ]);

  module.controller('RestaurantOfferListCtrl', ['$scope', '$resource', '$window',
    function($scope, $resource, $window) {
      var vm = this;
      $scope.$watchCollection(function() {
        return vm.offers;
      }, function(newCollection, oldCollection) {
        var dates = {};
        newCollection.forEach(function(offer) {
          var date = getDateWithoutTime(new Date(offer.from_time));
          var key = date.getTime();
          if (!dates.hasOwnProperty(key)) {
            dates[key] = {
              date: date,
              offers: [],
            };
          }
          dates[key].offers.push(offer);
        });
        vm.offersByDate = [];
        Object.keys(dates).sort().forEach(function(key) {
          vm.offersByDate.push(dates[key]);
        });
      });
      vm.isToday = function(date) {
        var dateCopy = new Date(date.getTime());
        dateCopy.setHours(0, 0, 0, 0);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateCopy.getTime() === today.getTime();
      };
      vm.offers = $resource('api/v1/restaurant/offers', {}, {
        update: offerUpdateOperation,
        delete: offerDeleteOperation,
      }).query();
      vm.updateOffer = function(currentOffer, offer) {
        offer.confirmationPending = true;
        var index = vm.offers.indexOf(currentOffer);
        if (index > -1) {
          vm.offers[index] = offer;
        }
        offer.$update({}, function success() {
          offer.confirmationPending = false;
        }, function error() {
          // Put back the previous version if the update fails
          var index = vm.offers.indexOf(offer);
          if (index > -1) {
            vm.offers[index] = currentOffer;
          }
        });

      };
      vm.deleteOffer = function(offer) {
        var confirmed = $window.confirm('Oled sa kindel et sa tahad kustutada pakkumise "'+offer.title+'"?');
        if (!confirmed) return;
        offer.confirmationPending = true;
        offer.$delete({}, function success() {
          var index = vm.offers.indexOf(offer);
          if (index > -1) {
            vm.offers.splice(index, 1);
          }
        }, function error(resp) {
          offer.confirmationPending = false;
          offer.hasWarning = true;
        });
      };
      $scope.$on(offerPostedEventChannel, function(event, offer) {
        vm.offers.unshift(offer);

        offer.confirmationPending = true;
        offer.$promise.then(function() {
          offer.confirmationPending = false;
        }, function() {
          // we could, in theory, use shift(), but I don't think we can guarantee at
          // this point that this offer is still the first one
          var index = vm.offers.indexOf(offer);
          if (index > -1) {
            vm.offers.splice(index, 1);
          }
        });
      });

      function getDateWithoutTime(dateWithTime) {
        var date = new Date(dateWithTime.getTime());
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
  ]);
})();
