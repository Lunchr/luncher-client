(function() {
  'use strict';
  var module = angular.module('commonFilters', []);

  module.filter('joinTags', function() {
    // http://stackoverflow.com/a/1026087/1456578
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return function(input) {
      if (input && input.length){
        var lowercaseTags = input.map(function(tag) {
          if (tag.text) {
            return tag.text.toLowerCase();
          }
          return tag.toLowerCase();
        });
        lowercaseTags[0] = capitalizeFirstLetter(lowercaseTags[0]);
        return lowercaseTags.join(', ');
      }
    };
  });
})();
