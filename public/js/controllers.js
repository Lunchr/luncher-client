var phonecatApp = angular.module('phonecatApp', []);
 
phonecatApp.controller('PhoneListCtrl', function ($scope) {
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
