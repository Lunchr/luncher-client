'use strict';
var praadApp = angular.module('praadApp', []);
 
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

praadApp.controller('TagListCtrl', function ($scope) {
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
});

praadApp.filter('tag', function($scope){
	return function(input){
		return true;
	};
});
