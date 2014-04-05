'use strict';
var offerListControllers = angular.module('offerListControllers', [
  'offerListFilters'
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
     'location': 'Asian Chef',
     'title': 'Sweet & Sour Pork',
     'description': 'Seafilee aedviljadega rikkalikus magushapus kastmes.',
     'price': 3.5,
     'tags': ['siga']},
    {'id': '3',
     'location': 'Asian Chef',
     'title': 'Sweet & Sour Duck',
     'description': 'Pardifilee aedviljadega rikkalikus magushapus kastmes.',
     'price': 3.6,
     'tags': ['part']}
  ];
});

offerListControllers.controller('TagListCtrl', ['$scope', 'offerFilterState', function ($scope, offerFilterState) {
  $scope.tagList = [
    {'id': 'kala',
     'label': 'Kalast'},
    {'id': 'lind',
     'label': 'Linnust'},
    {'id': 'siga',
     'label': 'Seast'},
    {'id': 'veis',
     'label': 'Veisest'},
    {'id': 'lammas',
     'label': 'Lambast'}
  ];

  $scope.$watch('tagList', function (tagList){
    offerFilterState.selectedTags = [];
    tagList.forEach(function (tag){
      if (tag.selected){
        offerFilterState.selectedTags.push(tag.id);
      }
    });
  }, true);
}]);

offerListControllers.controller('SearchCtrl', ['$scope', 'offerFilterState', function ($scope, offerFilterState) {
  $scope.$watch('query', function (query){
    offerFilterState.query = query;
  }, true);
}]);
