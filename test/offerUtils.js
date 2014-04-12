var offerUtils = (function (){
  'use strict';
  return {
    getMockOffers: function (){
      return [
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
      'title': 'Sweet & Sour Beef',
      'description': 'Veisefilee aedviljadega rikkalikus magushapus kastmes.',
      'price': 3.6,
      'tags': ['loom']}
      ];
    },
    matchers: {
      toContainId: function(util, customEqualityTesters) {
        return {
          compare: function (actual, expected){
            var result = {};

            result.pass = actual.some(function (elem){
              return elem.id === expected;
            });

            var notText = result.pass ? ' not' : '';
            result.message = 'Expected ' + actual + notText + ' to contain id ' + expected;
            return result;
          }
        };
      },
      toHaveIdOrder: function(util, customEqualityTesters) {
        return {
          compare: function (actual, expected){
            var result = {};

            var sameLength = actual.length === expected.length;
            var sameIdOrder = expected.every(function (id, index){
              return actual[index].id === id;
            });
            result.pass = sameLength && sameIdOrder;

            var actualIds = actual.map(function (elem){
              return elem.id;
            });
            var notText = result.pass ? ' not' : '';
            result.message = 'Expected offers ' + notText + ' to be ordered like: ' + expected + '. Got: ' + actualIds;
            return result;
          }
        };
      }
    }
  };
})();
