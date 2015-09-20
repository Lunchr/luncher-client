describe('facebookGroupPostDirective', function() {
  'use strict';
  beforeEach(function() {
    module('facebookGroupPostDirective', 'partials');
  });

  describe('facebook-group-post directive', function() {
    var $httpBackend;
    var ctrl, element, $scope, $parentScope;
    var getPostResponse = memo().is(function() {});

    beforeEach(inject(function(_$httpBackend_) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('api/v1/restaurants/1337/posts/2011-04-04').respond.apply(null, getPostResponse());
      var compiled = utils.compile('<facebook-group-post ' +
        'on-submit="submitClicked()" ' +
        'on-cancel="cancelClicked()" ' +
        'restaurant-id="1337" ' +
        'default-template="defaultTemplate" ' +
        'date="date" ' +
        '</facebook-group-post>',
      function(parentScope) {
        parentScope.date = "2011-04-04";
        parentScope.defaultTemplate = "default message template";
        parentScope.submitClicked = jasmine.createSpy();
      });
      element = compiled.element;
      $scope = compiled.scope;
      ctrl = $scope.ctrl;
      $parentScope = compiled.parentScope;
    }));

   afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

    context('with a successful initial GET', function() {
      getPostResponse.is(function() {
        return [{
          _id: 1234,
          date: '2011-04-14',
          message_template: 'a message template',
        }];
      });

      it('sets the post info onto the controller', function() {
        expect(ctrl.post.$resolved).toBe(false);
        $httpBackend.flush();
        expect(ctrl.post._id).toEqual(1234);
        expect(ctrl.post.date).toEqual('2011-04-14');
        expect(ctrl.post.message_template).toEqual('a message template');
      });

      describe('#submit', function() {
        var putPostResponse = memo().is(function() {});

        beforeEach(function() {
          $httpBackend.flush();
          $httpBackend.expectPUT('api/v1/restaurants/1337/posts/2011-04-14').respond.apply(null, putPostResponse());
          ctrl.post.message_template = 'a new message template';
        });

        context('with PUT succeeding', function() {
          putPostResponse.is(function() {
            return [{
              _id: 1234,
              date: '2011-04-14',
              message_template: 'a new message template',
            }];
          });

          it('marks submitPending to true while no response', function() {
            expect(ctrl.submitPending).toBeFalsy();
            ctrl.submit();
            expect(ctrl.submitPending).toBe(true);
            $httpBackend.flush();
            expect(ctrl.submitPending).toBe(false);
          });

          it('calls onSubmit binded method after successful submit', function() {
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            ctrl.submit();
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            $httpBackend.flush();
            expect($parentScope.submitClicked).toHaveBeenCalled();
          });

          it('PUTs the new message', function() {
            $httpBackend.resetExpectations();
            $httpBackend.expectPUT('api/v1/restaurants/1337/posts/2011-04-14', {
              _id: 1234 ,
              date: '2011-04-14',
              message_template: 'a new message template',
            }).respond.apply(null, putPostResponse());
            ctrl.submit();
            $httpBackend.flush();
          });
        });

        context('with PUT failing', function() {
          putPostResponse.is(function() { return [500, 'put failed']; });

          it('marks submitPending to true while no response', function() {
            expect(ctrl.submitPending).toBeFalsy();
            ctrl.submit();
            expect(ctrl.submitPending).toBe(true);
            $httpBackend.flush();
            expect(ctrl.submitPending).toBe(false);
          });

          it('does not call onSubmit binded method after unsuccessful submit', function() {
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            ctrl.submit();
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            $httpBackend.flush();
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
          });

          it('marks the ctrl to an error state', function() {
            ctrl.submit();
            $httpBackend.flush();
            expect(ctrl.error).toEqual('put failed');
          });
        });
      });
    });

    context('with initial GET returning 404', function() {
      getPostResponse.is(function() { return [404]; });

      it('loads the default template for the post', function() {
        expect(ctrl.post.$resolved).toBe(false);
        $httpBackend.flush();
        expect(ctrl.post._id).not.toBeDefined();
        expect(ctrl.post.date).toEqual('2011-04-04');
        expect(ctrl.post.message_template).toEqual('default message template');
      });

      describe('#submit', function() {
        var postPostResponse = memo().is(function() {});

        beforeEach(function() {
          $httpBackend.flush();
          $httpBackend.expectPOST('api/v1/restaurants/1337/posts').respond.apply(null, postPostResponse());
          ctrl.post.message_template = 'a new message template';
        });

        context('with POST succeeding', function() {
          postPostResponse.is(function() {
            return [{
              _id: 1234,
              date: '2011-04-04',
              message_template: 'a new message template',
            }];
          });

          it('marks submitPending to true while no response', function() {
            expect(ctrl.submitPending).toBeFalsy();
            ctrl.submit();
            expect(ctrl.submitPending).toBe(true);
            $httpBackend.flush();
            expect(ctrl.submitPending).toBe(false);
          });

          it('calls onSubmit binded method after successful submit', function() {
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            ctrl.submit();
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            $httpBackend.flush();
            expect($parentScope.submitClicked).toHaveBeenCalled();
          });

          it('POSTs the new message', function() {
            $httpBackend.resetExpectations();
            $httpBackend.expectPOST('api/v1/restaurants/1337/posts', {
              date: '2011-04-04',
              message_template: 'a new message template',
            }).respond.apply(null, postPostResponse());
            ctrl.submit();
            $httpBackend.flush();
            expect(ctrl.post._id).toEqual(1234);
          });
        });

        context('with POST failing', function() {
          postPostResponse.is(function() { return [500, 'post failed']; });

          it('marks submitPending to true while no response', function() {
            expect(ctrl.submitPending).toBeFalsy();
            ctrl.submit();
            expect(ctrl.submitPending).toBe(true);
            $httpBackend.flush();
            expect(ctrl.submitPending).toBe(false);
          });

          it('does not call onSubmit binded method after unsuccessful submit', function() {
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            ctrl.submit();
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
            $httpBackend.flush();
            expect($parentScope.submitClicked).not.toHaveBeenCalled();
          });

          it('marks the ctrl to an error state', function() {
            ctrl.submit();
            $httpBackend.flush();
            expect(ctrl.error).toEqual('post failed');
          });
        });
      });
    });

    context('with initial GET failing', function() {
      getPostResponse.is(function() { return [500, 'an error message']; });

      it('marks the ctrl to an error state', function() {
        expect(ctrl.post.$resolved).toBe(false);
        $httpBackend.flush();
        expect(ctrl.post._id).not.toBeDefined();
        expect(ctrl.post.date).not.toBeDefined();
		expect(ctrl.error).toEqual('an error message');
      });
    });
  });
});
