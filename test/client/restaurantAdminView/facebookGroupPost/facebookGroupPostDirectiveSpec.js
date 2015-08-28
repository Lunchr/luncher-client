describe('facebookGroupPostDirective', function() {
  'use strict';
  beforeEach(function() {
    module('facebookGroupPostDirective', 'partials');
  });

  describe('facebook-group-post directive', function() {
    var ctrl, element, $scope, $parentScope;
    var postResponse = memo().is(function() {});

    beforeEach(inject(function($httpBackend) {
      $httpBackend.expectGET('api/v1/restaurant/posts/2011-04-04').respond(postResponse());
      var compiled = utils.compile('<facebook-group-post ' +
        'on-submit="submitClicked()" ' +
        'on-cancel="cancelClicked()" ' +
        'default-template="defaultTemplate" ' +
        'date="date" ' +
        '</facebook-group-post>',
      function(parentScope) {
        parentScope.date = "2011-04-04";
        parentScope.defaultTemplate = "default message template";
      });
      element = compiled.element;
      $scope = compiled.scope;
      ctrl = $scope.ctrl;
      $parentScope = compiled.parentScope;
    }));

    context('with a successful initial GET', function() {
      postResponse.is(function() {
        return {
          _id: 1234,
          date: '2011-04-14',
          message_template: 'a message template',
        };
      });

      it('sets the post info onto the controller', inject(function($httpBackend) {
        expect(ctrl.post.$resolved).toBe(false);
        $httpBackend.flush();
        expect(ctrl.post._id).toEqual(1234);
        expect(ctrl.post.date).toEqual('2011-04-14');
        expect(ctrl.post.message_template).toEqual('a message template');
      }));
    });

    context('with initial GET returning 404', function() {
      postResponse.is(function() { return 404; });

      it('loads the default template for the post', inject(function($httpBackend) {
        expect(ctrl.post.$resolved).toBe(false);
        $httpBackend.flush();
        expect(ctrl.post._id).not.toBeDefined();
        expect(ctrl.post.date).toEqual('2011-04-04');
        expect(ctrl.post.message_template).toEqual('default message template');
      }));
    });
  });
});
