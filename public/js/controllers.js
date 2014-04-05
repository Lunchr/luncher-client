'use strict';
var praadApp = angular.module('praadApp', []);

praadApp.value('offerFilterState', {});

praadApp.factory('doIntersect', function(){
  return function (as, bs){
    if (!as || !bs) return false;
    return as.some(function (a){
      return bs.some(function (b){
          return a === b;
      });
    });
  };
});
 
praadApp.controller('OfferListCtrl', function ($scope) {
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

praadApp.controller('TagListCtrl', ['$scope', 'offerFilterState', function ($scope, offerFilterState) {
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

  $scope.tagSelectionChanged = function(){
    offerFilterState.selectedTags = [];
    $scope.tagList.forEach(function (tag){
      if (tag.selected){
        offerFilterState.selectedTags.push(tag.id);
      }
    });
  };

}]);

praadApp.filter('tag', ['filterFilter', 'offerFilterState', 'doIntersect', function (filterFilter, offerFilterState, doIntersect){
  return function (offers){
    return filterFilter(offers, function (offer){
      if (offerFilterState.selectedTags && offerFilterState.selectedTags.length > 0){
        return doIntersect(offerFilterState.selectedTags, offer.tags);
      }
      return true;
    });
  };
}]);
