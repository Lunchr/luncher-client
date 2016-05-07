describe('Offer Form', function() {
  'use strict';
  beforeEach(function() {
    module('offerFormDirective', 'partials');
  });

  var triggerKeyDown = function (element, code) {
    var e = new window.KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
    });
    delete e.keyCode;

    Object.defineProperty(e, 'keyCode', {'value': code});
    element.dispatchEvent(e);
  };

  describe('offer-form directive', function() {
    var element, $scope, $parentScope, mockTags;

    beforeEach(inject(function($httpBackend) {
      mockTags = offerUtils.getMockTags();
      $httpBackend.expectGET('api/v1/tags').respond(mockTags);
      var compiled = utils.compile('<offer-form on-submit="submitClicked($offer)" on-cancel="cancelClicked()" on-delete="deleteClicked()"></offer-form>');
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
    }));

    it('should have tags data after we mock-respond to the HTTP request', inject(function($httpBackend) {
      expect($scope.allTags.length).toBe(0);
      $httpBackend.flush();
      expect($scope.allTags.length).toBe(5);
    }));

    describe('with the http requests mock-responded', function() {
      beforeEach(inject(function($httpBackend) {
        $httpBackend.flush();
      }));

      it('should cache the tags request', inject(function($httpBackend) {
        // we'll create another directive and without flushing expect the tags to be resolved
        var compiled = utils.compile('<offer-form></offer-form>');
        expect(compiled.scope.allTags.length).toBe(5);
      }));

      it('should have a date string representing yesterday', function() {
        var now = new Date();
        var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        var yesterdayInUTC = Date.parse($scope.yesterday);
        expect(yesterdayInUTC).toEqual(yesterday.getTime() - yesterday.getTimezoneOffset() * 60 * 1000);
      });

      it('should have a new offer ID prefix', function() {
        expect($scope.idPrefix).toEqual('new-offer-');
      });

      describe('getFilteredTags', function() {
        it('should return (mocked) tags that match the query', function() {
          var result = $scope.getFilteredTags('a');
          expect(result.length).toBe(3);
          expect(result[0].name).toBe('kala');
          expect(result[1].name).toBe('siga');
          expect(result[2].name).toBe('praad');
        });

        it('should return (mocked) tags that match the query', function() {
          var result = $scope.getFilteredTags('l');
          expect(result.length).toBe(2);
          expect(result[0].name).toBe('kala');
          expect(result[1].name).toBe('lind');
        });

        it('should return no tags if bad query', function() {
          var result = $scope.getFilteredTags('blablabla');
          expect(result.length).toBe(0);
        });
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



      describe('submitOffer', function() {
        beforeEach(function() {
          $parentScope.submitClicked = jasmine.createSpy();
        });

        describe('with the form filled', function() {
          beforeEach(function() {
            $scope.title = 'a title';
            $scope.description = 'a short description';
            $scope.tags = [{
              name: 'tag1',
              a: 'a'
            }, {
              name: 'tag2',
              a: 'b'
            }];
            $scope.price = 2.5;
            $scope.date = new Date(2015, 3, 15);
            $scope.fromTime = new Date(1970, 0, 1, 10, 0, 0);
            $scope.toTime = new Date(1970, 0, 1, 15, 0, 0);
            $scope.image = {src: 'image data'};
          });

          it('should call the specified function with $offer as the argument', function() {
            $scope.submitOffer();

            expect($parentScope.submitClicked).toHaveBeenCalledWith({
              title: 'a title',
              description: 'a short description',
              tags: ['tag1', 'tag2'],
              price: 2.5,
              from_time: new Date(2015, 3, 15, 10, 0, 0),
              to_time: new Date(2015, 3, 15, 15, 0, 0),
              image_data: 'image data',
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

      describe('deleteOffer', function() {
        beforeEach(function() {
          $parentScope.deleteClicked = jasmine.createSpy();
        });

        it('should call the specified function with $offer as the argument', function() {
          $scope.deleteFunction();

          expect($parentScope.deleteClicked).toHaveBeenCalled();
        });
      });

      describe('selecting a suggestion', function() {
        var suggestions = [{
          _id: '11',
          title: 'a title',
          description: 'ingredient1, ingredient2',
          tags: ['tag1', 'tag2'],
          price: 2.5,
          from_time: new Date(2115, 3, 15, 10, 0, 0),
          to_time: new Date(2115, 3, 15, 15, 0, 0),
          image: {
            large: 'large image path',
            thumbnail: 'thumbnail path',
          },
        },{
          _id: '12',
          title: 'another title',
          description: 'ingredient3, ingredient4',
          tags: ['tag3', 'tag4'],
          price: 3.5,
          from_time: new Date(2114, 3, 15, 10, 0, 0),
          to_time: new Date(2114, 3, 15, 15, 0, 0),
          image: {
            large: 'another large image path',
            thumbnail: 'another thumbnail path',
          },
        }];

        var firstSuggestion = null;
        var titleInput = null;

        beforeEach(function() {
          $scope.suggestions = suggestions;
          $scope.$apply();
          firstSuggestion = angular.element(element[0].querySelector('ul.suggestions li'));
          expect(firstSuggestion).toBeTruthy();
          titleInput = element[0].querySelector('[name=title]');
          expect(titleInput).toBeTruthy();
        });

        var itCompletesFormWithFirstSuggestion = function() {
          it('completes the form with first suggestion', function() {
            expect($scope.title).toBe(suggestions[0].title);
            expect($scope.description).toEqual(suggestions[0].description);
            expect($scope.tags).toEqual([{
              name: suggestions[0].tags[0],
            }, {
              name: suggestions[0].tags[1],
            }]);
            expect($scope.price).toEqual(suggestions[0].price);
            expect($scope.image.src).toEqual(suggestions[0].image.large);
          });

          it('does not change time fields', function() {
            expect($scope.date).not.toEqual(new Date(2115, 3, 15));
            expect($scope.fromTime).not.toEqual(new Date(1970, 0, 1, 10, 0, 0));
            expect($scope.toTime).not.toEqual(new Date(1970, 0, 1, 15, 0, 0));
          });
        };

        context('when clicking on first suggestion', function() {
          beforeEach(function() {
            firstSuggestion.trigger('mousedown');
          });

          itCompletesFormWithFirstSuggestion();
        });

        (navigator.userAgent.indexOf('PhantomJS') != -1 ? xcontext : context)(
          'when selecting first suggestion with down key + enter', function() {
            beforeEach(function() {
              triggerKeyDown(titleInput, 40);
              triggerKeyDown(titleInput, 13);
            });

            itCompletesFormWithFirstSuggestion();
          }
        );

        (navigator.userAgent.indexOf('PhantomJS') != -1 ? xcontext : context)(
          'when selecting first suggestion with up key + enter', function() {
            beforeEach(function() {
              triggerKeyDown(titleInput, 38);
              triggerKeyDown(titleInput, 38);
              triggerKeyDown(titleInput, 13);
            });

            itCompletesFormWithFirstSuggestion();
          }
        );
      });
    });
  });

  describe('edit an offer with offer-form directive', function() {
    var element, $scope, $parentScope;

    beforeEach(inject(function($httpBackend) {
      $httpBackend.whenGET('api/v1/tags').respond(offerUtils.getMockTags());
      var compiled = utils.compile('<offer-form edit="prefillOffer" on-submit="submitClicked($offer)"></offer-form>', function(parentScope) {
        parentScope.prefillOffer = {
          _id: '11',
          title: 'a title',
          description: 'ingredient1, ingredient2',
          tags: ['tag1', 'tag2'],
          price: 2.5,
          from_time: new Date(2115, 3, 15, 10, 0, 0),
          to_time: new Date(2115, 3, 15, 15, 0, 0),
          image: {
            large: 'large image path',
            thumbnail: 'thumbnail path',
          },
        };
      });
      element = compiled.element;
      $scope = compiled.scope;
      $parentScope = compiled.parentScope;
      $parentScope.submitClicked = jasmine.createSpy();
      $httpBackend.flush();
    }));

    it('should have an edit offer ID prefix', function() {
      expect($scope.idPrefix).toEqual('edit-offer-11-');
    });

    it('should prefill the inner scope variables', function() {
      expect($scope.title).toBe('a title');
      expect($scope.description).toEqual('ingredient1, ingredient2');
      expect($scope.tags).toEqual([{
        name: 'tag1'
      }, {
        name: 'tag2'
      }]);
      expect($scope.price).toEqual(2.5);
      expect($scope.date).toEqual(new Date(2115, 3, 15));
      expect($scope.fromTime).toEqual(new Date(1970, 0, 1, 10, 0, 0));
      expect($scope.toTime).toEqual(new Date(1970, 0, 1, 15, 0, 0));
      expect($scope.image.src).toEqual('large image path');
    });

    describe('submit', function() {
      it('should copy and extend the the original offer', function() {
        $scope.title = 'a changed title';
        $scope.submitOffer();

        expect($parentScope.submitClicked).toHaveBeenCalledWith({
          _id: '11',
          title: 'a changed title',
          description: 'ingredient1, ingredient2',
          tags: ['tag1', 'tag2'],
          price: 2.5,
          from_time: new Date(2115, 3, 15, 10, 0, 0),
          to_time: new Date(2115, 3, 15, 15, 0, 0),
        });
      });

      describe('with the image changed', function() {
        beforeEach(function() {
          $scope.image = {src: 'image data'};
        });

        it('should copy and extend the the original offer', function() {
          $scope.submitOffer();

          expect($parentScope.submitClicked).toHaveBeenCalledWith({
            _id: '11',
            title: 'a title',
            description: 'ingredient1, ingredient2',
            tags: ['tag1', 'tag2'],
            price: 2.5,
            from_time: new Date(2115, 3, 15, 10, 0, 0),
            to_time: new Date(2115, 3, 15, 15, 0, 0),
            image_data: 'image data',
          });
        });
      });
    });
  });
});
