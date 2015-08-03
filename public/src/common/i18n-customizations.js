(function() {
  'use strict';
  angular.module('i18nCustomizations', [], ['$provide',
    function($provide) {
      $provide.decorator('$locale', ['$delegate',
        function($delegate) {
          if($delegate.id === 'et-ee') {
            $delegate.DATETIME_FORMATS.justDate = 'd. MMMM';
          }
          return $delegate;
        }
      ]);
    }
  ]);


})();
