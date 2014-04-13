(function(){
  'use strict';
  var offerListControllers = angular.module('offerListControllers', [
    'ngResource',
    'offerListFilters',
    'offerListSorters'
    ]);

  offerListControllers.controller('OfferListCtrl', function ($scope) {
    $scope.offers = [
    {'id': '1',
    'location': 'Asian Chef',
    'title': 'Sweet & Sour Chicken',
    'description': 'Kanafilee aedviljadega rikkalikus magushapus kastmes.',
    'price': 3.4,
    'tags': ['lind']},
    {'id': '2',
    'location': 'Bulgarian Chef',
    'title': 'Sweet & Sour Pork',
    'description': 'Seafilee aedviljadega rikkalikus magushapus kastmes.',
    'price': 3.3,
    'tags': ['siga']},
    {'id': '3',
    'location': 'Caesar Chef',
    'title': 'Sweet & Sour Duck',
    'description': 'Pardifilee aedviljadega rikkalikus magushapus kastmes.',
    'price': 3.6,
    'tags': ['part']}
    ];
  });

  offerListControllers.controller('TagListCtrl', ['$scope', 'offerFilterState', '$resource',
    function ($scope, offerFilterState, $resource) {
      $scope.tagList = $resource('offers/tags.json').query();

      $scope.$watch('tagList', function (tagList){
        offerFilterState.selectedTags = [];
        tagList.forEach(function (tag){
          if (tag.selected){
            offerFilterState.selectedTags.push(tag.id);
          }
        });
      }, true);
    }
    ]);

  offerListControllers.controller('SearchCtrl', ['$scope', 'offerFilterState', function ($scope, offerFilterState) {
    $scope.$watch('query', function (query){
      offerFilterState.query = query;
    }, true);
  }]);
})();
