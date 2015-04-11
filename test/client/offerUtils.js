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
        'ingredients': ['Kana', 'aedviljad', 'tsillikaste'],
        'price': 3.4,
        'tags': ['lind']
      }, {
        '_id': '2',
        'restaurant': {
          'name': 'Bulgarian Chef'
        },
        'title': 'Sweet & Sour Pork',
        'ingredients': ['Seafilee', 'aedviljad', 'mahushapu kaste'],
        'price': 3.3,
        isFavorite: true,
        'tags': ['siga']
      }, {
        '_id': '3',
        'restaurant': {
          'name': 'Caesar Chef'
        },
        'title': 'Sweet & Sour Beef',
        'ingredients': ['Veiseliha pihv', 'burgerisai', 'kodused friikartulid', 'kaste', 'salat'],
        'price': 3.6,
        'tags': ['loom']
      }, {
        '_id': '4',
        'restaurant': {
          'name': 'Dutch Dishes'
        },
        'title': 'Sweet & Sour Duck',
        'ingredients': ['Part', 'aedviljad', 'magushapu kaste'],
        'price': 3.2,
        isFavorite: true,
        'tags': ['lind']
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
    getMockRegions: function() {
      return [{
        'name':     'Tartu',
        'location': 'Europe/Tallinn',
        'cctld':    'ee',
      },{
        'name':     'Tallinn',
        'location': 'Europe/Tallinn',
        'cctld':    'ee',
      },{
        'name':     'London',
        'location': 'Europe/London',
        'cctld':    'uk',
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
