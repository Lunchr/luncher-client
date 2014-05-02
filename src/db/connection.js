module.exports = (function() {
  'use strict';

  return {
    offers: (function() {

      return {
        get: function(callback) {
          callback(null, [{
            'id': '1',
            'location': 'Asian Chef',
            'title': 'Sweet & Sour Chicken',
            'description': 'Kanafilee aedviljadega rikkalikus magushapus kastmes.',
            'price': 3.4,
            'tags': [
              'lind'
            ]
          }, {
            'id': '2',
            'location': 'Bulgarian Chef',
            'title': 'Sweet & Sour Pork',
            'description': 'Seafilee aedviljadega rikkalikus magushapus kastmes.',
            'price': 3.3,
            'tags': [
              'siga'
            ]
          }, {
            'id': '3',
            'location': 'Caesar Chef',
            'title': 'Sweet & Sour Duck',
            'description': 'Pardifilee aedviljadega rikkalikus magushapus kastmes.',
            'price': 3.6,
            'tags': [
              'part'
            ]
          }]);
        }
      };
    })()
  };
})();
