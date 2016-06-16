(function() {
  'use strict';
  var module = angular.module('restaurantAdminViewControllers', [
    'ngResource',
  ]);
  var offerPostedEventChannel = 'offer-posted';
  var offerUpdateOperation = {
    method: 'PUT',
    url: 'api/v1/restaurants/:restaurantID/offers/:id',
    params: {
      id: '@_id'
    },
  };
  var offerDeleteOperation = {
    method: 'DELETE',
    url: 'api/v1/restaurants/:restaurantID/offers/:id',
    params: {
      id: '@_id'
    },
  };
  var FB_PUBLISH_TIME_BUFFER = 1000 * 60 * 15; // 15 min
  var A_DAY = 1000 * 60 * 60 * 24;
  var reduceNonEmptyList = R.curry(function(fn, list) {
    return R.reduce(R.min, R.head(list), R.tail(list));
  });

  module.controller('RestaurantAdminViewCtrl', ['$scope', '$resource', 'restaurant', 'restaurants',
    function($scope, $resource, restaurant, restaurants) {
      var vm = this;
      vm.restaurant = restaurant;
      vm.restaurants = restaurants;
      vm.postOffer = function(offer) {
        offer.restaurant = vm.restaurant;
        var postedOffer = $resource('api/v1/restaurants/:restaurantID/offers', {
          restaurantID: restaurant._id,
        }, {
          update: offerUpdateOperation,
          delete: offerDeleteOperation,
        }).save(offer);
        $scope.$broadcast(offerPostedEventChannel, postedOffer);
      };
    }
  ]);

  module.controller('RestaurantOfferListCtrl', ['$scope', '$resource', '$window',
    function($scope, $resource, $window) {
      var ctrl = this;
      $scope.$watchCollection(function() {
        return ctrl.offers;
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
        ctrl.offersByDate = [];
        Object.keys(dates).sort().forEach(function(key) {
          ctrl.offersByDate.push(dates[key]);
        });
        ctrl.offersByDate.forEach(function(offerGroup) {
          var firstOfferTime = R.compose(
            reduceNonEmptyList(R.min),
            R.map(R.constructN(1, Date)),
            R.map(R.prop('from_time'))
          )(offerGroup.offers);
          offerGroup.fbPostTime = new Date(firstOfferTime.getTime() - FB_PUBLISH_TIME_BUFFER);
        });
      });
      ctrl.isToday = function(date) {
        var dateCopy = new Date(date.getTime());
        dateCopy.setHours(0, 0, 0, 0);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateCopy.getTime() === today.getTime();
      };
      ctrl.offers = $resource('api/v1/restaurants/:restaurantID/offers', {
        restaurantID: $scope.vm.restaurant._id,
      }, {
        update: offerUpdateOperation,
        delete: offerDeleteOperation,
      }).query();
      ctrl.updateOffer = function(currentOffer, offer) {
        offer.confirmationPending = true;
        var index = ctrl.offers.indexOf(currentOffer);
        if (index > -1) {
          ctrl.offers[index] = offer;
        }
        offer.$update({}, function success() {
          offer.confirmationPending = false;
        }, function error() {
          // Put back the previous version if the update fails
          var index = ctrl.offers.indexOf(offer);
          if (index > -1) {
            ctrl.offers[index] = currentOffer;
          }
        });

      };
      ctrl.deleteOffer = function(offer) {
        var confirmed = $window.confirm('Oled sa kindel et sa tahad kustutada pakkumise "'+offer.title+'"?');
        if (!confirmed) return;
        offer.confirmationPending = true;
        offer.$delete({}, function success() {
          var index = ctrl.offers.indexOf(offer);
          if (index > -1) {
            ctrl.offers.splice(index, 1);
          }
        }, function error(resp) {
          offer.confirmationPending = false;
          offer.hasWarning = true;
        });
      };
      $scope.$on(offerPostedEventChannel, function(event, offer) {
        ctrl.offers.unshift(offer);

        offer.confirmationPending = true;
        offer.$promise.then(function() {
          offer.confirmationPending = false;
        }, function() {
          // we could, in theory, use shift(), but I don't think we can guarantee at
          // this point that this offer is still the first one
          var index = ctrl.offers.indexOf(offer);
          if (index > -1) {
            ctrl.offers.splice(index, 1);
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
