var offerUtils = (function() {
  'use strict';
  return {
    getMockOffers: function() {
      return [{
        '_id': '1',
        'restaurant': {
          'name': 'Asian Chef',
          'address': 'Kompanii 10, Tartu',
          'location': {
            'type': 'Point',
            'coordinates': [26.722691, 58.380094]
          }
        },
        'from_time': '2016-11-11T11:00:00.000Z',
        'to_time': '2016-11-11T15:00:00.000Z',
        'title': 'Sweet & Sour Chicken',
        'description': 'Kana, aedviljad, tsillikaste',
        'price': 3.4,
        'tags': ['lind', 'praad']
      }, {
        '_id': '2',
        'restaurant': {
          'name': 'Bulgarian Chef',
          'address': 'Kompanii 10, Tartu',
          'location': {
            'type': 'Point',
            'coordinates': [26.722691, 58.380094]
          }
        },
        'from_time': '2016-11-11T11:00:00.000Z',
        'to_time': '2016-11-11T15:00:00.000Z',
        'title': 'Sweet & Sour Pork',
        'description': 'Seafilee, aedviljad, mahushapu kaste',
        'price': 3.3,
        'tags': ['siga', 'praad']
      }, {
        '_id': '3',
        'restaurant': {
          'name': 'Caesar Chef',
          'address': 'Kompanii 10, Tartu',
          'location': {
            'type': 'Point',
            'coordinates': [26.722691, 58.380094]
          }
        },
        'from_time': '2016-11-12T11:00:00.000Z',
        'to_time': '2016-11-12T15:00:00.000Z',
        'title': 'Sweet & Sour Beef',
        'description': 'Veiseliha pihv, burgerisai, kodused friikartulid, kaste, salat',
        'price': 3.6,
        'tags': ['loom', 'praad']
      }, {
        '_id': '4',
        'restaurant': {
          'name': 'Dutch Dishes',
          'address': 'Kompanii 10, Tartu',
          'location': {
            'type': 'Point',
            'coordinates': [26.722691, 58.380094]
          }
        },
        'from_time': '2016-11-13T11:00:00.000Z',
        'to_time': '2016-11-13T15:00:00.000Z',
        'title': 'Sweet & Sour Duck Soup',
        'description': 'Part, aedviljad, magushapu kaste',
        'price': 3.2,
        'tags': ['lind', 'supp']
      }];
    },
    getMockRestaurant: function() {
      return {
        '_id': '3',
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
      }, {
        'name': 'praad',
        'display_name': 'Praad'
      }, {
        'name': 'supp',
        'display_name': 'Supp'
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
    getMockPages: function() {
      return [{
        id: '1',
        name: 'La Dolce Vita',
        address: 'Kompanii 10, Tartu',
        phone: '+372 567 8910',
        website: 'ladolcevita.ee',
      },{
        id: '2',
        name: 'Dolor sit amet',
      },{
        id: '3',
        name: 'Vestibulum ipsum',
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
            if (!result.pass) {
              result.pass = actual.some(function(restaurant) {
                if (!(restaurant.offers instanceof Array)) {
                  return false;
                }
                return restaurant.offers.some(function(offer) {
                  return offer._id === expected;
                });
              });
            }

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
