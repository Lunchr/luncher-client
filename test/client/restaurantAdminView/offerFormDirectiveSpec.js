describe('Offer Form', function() {
  'use strict';
  beforeEach(function() {
    module('offerFormDirective', 'partials', function($provide) {
      $provide.provider('fileReader', {
        $get: function() {
          return {};
        }
      });
    });
  });
  describe('previewImage directive', function() {
    var element, parentScope;
    beforeEach(function() {
      var compiled = utils.compile('<a preview-image />');
      element = compiled.element;
      parentScope = compiled.parentScope;

      parentScope.setAsPreview = jasmine.createSpy();
    });

    it('should call setAsPreview method on parent scope with file data from change event', function() {
      var file = 'a mock file object';
      element.prop('files', [file]);

      element.triggerHandler('change');

      expect(parentScope.setAsPreview).toHaveBeenCalledWith(file);
    });
  });

  describe('offer-form directive', function() {
    var element, $scope, $parentScope;

    beforeEach(function() {
      var compiled = utils.compile('<offer-form on-submit="submitClicked($offer)" on-cancel="cancelClicked()"></offer-form>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
    });

    it('should have a date string representing today', function() {
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      var todayInUTC = Date.parse($scope.today);
      expect(todayInUTC).toEqual(today.getTime() - today.getTimezoneOffset() * 60 * 1000);
    });

    describe('isReadyForError', function() {
      it('should return true when dirty, touched and invalid', function() {
        var input = {
          $dirty: true,
          $touched: true,
          $invalid: true,
        };
        expect($scope.isReadyForError(input)).toBe(true);
      });

      it('should return false when not dirty, but touched and invalid', function() {
        var input = {
          $dirty: false,
          $touched: true,
          $invalid: true,
        };
        expect($scope.isReadyForError(input)).toBe(false);
      });

      it('should return true when when first input is false, second true', function() {
        var input1 = {
          $dirty: false,
          $touched: true,
          $invalid: true,
        };
        var input2 = {
          $dirty: true,
          $touched: true,
          $invalid: true,
        };
        expect($scope.isReadyForError(input1, input2)).toBe(true);
      });
    });

    describe('setAsPreview', function() {
      var result, file;
      beforeEach(inject(function($q, fileReader) {
        var deferred = $q.defer();
        result = 'result data';
        deferred.resolve(result);
        fileReader.readAsDataUrl = jasmine.createSpy().and.returnValue(deferred.promise);
      }));

      describe('with file', function() {
        beforeEach(function() {
          file = 'a mock file';
        });

        it('should set previewImageSrc to the result', function() {
          $scope.setAsPreview(file);

          $scope.$apply();
          expect($scope.previewImageSrc).toBe(result);
        });
      });

      describe('without file', function() {
        beforeEach(function() {
          file = undefined;
        });

        it('should set previewImageSrc to the result', function() {
          $scope.setAsPreview(file);

          $scope.$apply();
          expect($scope.previewImageSrc).toBe('');
        });
      });
    });

    describe('submitOffer', function() {
      beforeEach(function() {
        $parentScope.submitClicked = jasmine.createSpy();
      });

      describe('with the form filled', function() {
        beforeEach(function() {
          $scope.title = 'a title';
          $scope.tags = ['tag1', 'tag2'];
          $scope.price = 2.5;
          $scope.date = new Date(2015, 3, 15);
          $scope.fromTime = new Date(1970, 0, 1, 10, 0, 0);
          $scope.toTime = new Date(1970, 0, 1, 15, 0, 0);
          $scope.image = 'image data';
        });

        it('should call the specified function with $offer as the argument', function() {
          $scope.submitOffer();

          expect($parentScope.submitClicked).toHaveBeenCalledWith({
            title: 'a title',
            tags: ['tag1', 'tag2'],
            price: 2.5,
            from_time: new Date(2015, 3, 15, 10, 0, 0),
            to_time: new Date(2015, 3, 15, 15, 0, 0),
            image: 'image data',
          });
        });
      });
    });

    describe('cancelOffer', function() {
      beforeEach(function() {
        $parentScope.cancelClicked = jasmine.createSpy();
      });

      it('should call the specified function with $offer as the argument', function() {
        $scope.cancelFunction();

        expect($parentScope.cancelClicked).toHaveBeenCalled();
      });
    });
  });
});
