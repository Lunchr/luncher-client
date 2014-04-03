'use strict';
var praadApp = angular.module('praadApp', []);

praadApp.value('offerFilterState', {});

praadApp.factory('doIntersect', function(){
  return function (as, bs){
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
     'price': 3.4},
    {'id': '2',
     'location': 'Asian Chef',
     'title': 'Sweet & Sour Beef',
     'description': 'Seafilee aedviljadega rikkalikus magushapus kastmes.',
     'price': 3.5},
    {'id': '3',
     'location': 'Asian Chef',
     'title': 'Sweet & Sour Duck',
     'description': 'Pardifilee aedviljadega rikkalikus magushapus kastmes.',
     'price': 3.6}
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
    offerFilterState.selectedTags = offerFilterState.selectedTags || [];
    $scope.tagList.forEach(function (tag){
      if (tag.selected){
        offerFilterState.selectedTags.push(tag.id);
      }
    });
  };

}]);

praadApp.filter('tag', ['offerFilterState', 'doIntersect', function (offerFilterState, doIntersect){
  return function(input){
    if (offerFilterState.selectedTags && offerFilterState.selectedTags.length > 0){
      return doIntersect(offerFilterState.selectedTags, input.tags);
    }
    return true;
  };
}]);
