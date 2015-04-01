var offerUtils = (function() {
  'use strict';
  return {
    getMockOffers: function() {
      return [{
        '_id': '1',
        'restaurant': {
          'name': 'Asian Chef'
        },
        'title': 'Sweet & Sour Chicken',
        'description': 'Kanafilee aedviljadega rikkalikus magushapus kastmes.',
        'price': 3.4,
        'tags': ['lind']
      }, {
        '_id': '2',
        'restaurant': {
          'name': 'Bulgarian Chef'
        },
        'title': 'Sweet & Sour Pork',
        'description': 'Seafilee aedviljadega rikkalikus magushapus kastmes.',
        'price': 3.3,
        'tags': ['siga']
      }, {
        '_id': '3',
        'restaurant': {
          'name': 'Caesar Chef'
        },
        'title': 'Sweet & Sour Beef',
        'description': 'Veisefilee aedviljadega rikkalikus magushapus kastmes.',
        'price': 3.6,
        'tags': ['loom']
      }];
    },
    getMockRestaurant: function() {
      return {
        'name': 'Bulgarian Chef',
        'address': 'Some street 3, Tartu'
      };
    },
    getMockTags: function() {
      return [{
        'name': 'kala',
        'display_name': 'Kalast'
      }, {
        'name': 'lind',
        'display_name': 'Linnust'
      }, {
        'name': 'siga',
        'display_name': 'Seast'
      }];
    },
    matchers: {
      toContainId: function(util, customEqualityTesters) {
        return {
          compare: function(actual, expected) {
            var result = {};

            result.pass = actual.some(function(elem) {
              return elem._id === expected;
            });

            var notText = result.pass ? ' not' : '';
            result.message = 'Expected ' + actual + notText + ' to contain id ' + expected;
            return result;
          }
        };
      },
      toHaveIdOrder: function(util, customEqualityTesters) {
        return {
          compare: function(actual, expected) {
            var result = {};

            var sameLength = actual.length === expected.length;
            var sameIdOrder = expected.every(function(id, index) {
              return actual[index]._id === id;
            });
            result.pass = sameLength && sameIdOrder;

            var actualIds = actual.map(function(elem) {
              return elem._id;
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
