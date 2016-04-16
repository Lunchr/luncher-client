describe('suggestionsObservable', function() {
  'use strict';
  var requestSuggestions = null;
  beforeEach(function() {
    module('offerFormDirective', function($provide) {
      $provide.factory('requestSuggestions', function() {
        return jasmine.createSpy();
      });
    });
    inject(function(_requestSuggestions_){
      requestSuggestions = _requestSuggestions_;
    });
  });

  var onNext = Rx.ReactiveTest.onNext;
  var onError = Rx.ReactiveTest.onError;
  var onCompleted = Rx.ReactiveTest.onCompleted;

  var restaurantID = '123';
  var titleInputs = memo().is(function() {
    return [];
  });

  var scheduler = null;
  var suggestions = null;
  var subscribeTime = 200;
  var debounceDelay = 500;

  beforeEach(inject(function($injector, _$httpBackend_) {
    scheduler = new Rx.TestScheduler();
    var titleObservable = scheduler.createColdObservable(titleInputs());
    var subject = function() {
      return $injector.get('suggestionsObservable')({
        titleObservable: titleObservable,
        restaurantID: restaurantID,
        scheduler: scheduler,
      });
    };
    suggestions = function() {
      return scheduler.startScheduler(subject, {
        created: 100,
        subscribed: subscribeTime,
        disposed: 2000,
      }).messages;
    };
  }));

  context('with only the initial title input', function() {
    titleInputs.is(function() {
      return [
        onNext(2, 'Lambaliha & parmesaniga pasta'),
      ];
    });

    it("doesn't fetch any suggestions", function() {
      expect(suggestions()).toEqual([]);
    });
  });

  context('with the title input only having up to 2 chars', function() {
    titleInputs.is(function() {
      return [
        onNext(2, 'Lambaliha & parmesaniga pasta'),
        onNext(200, 'l'),
        onNext(202, 'la'),
        onNext(204, 'l'),
        onNext(206, 'ls'),
        onNext(208, 'l'),
      ];
    });

    it("doesn't fetch any suggestions", function() {
      expect(suggestions()).toEqual([]);
    });
  });

  context('with rapid typing', function() {
    var firstInputDelay = 210;
    var lastInputDelay = 216;
    var lastInputTime = subscribeTime + lastInputDelay;
    var requestDelay = 50;
    var suggestionTime = lastInputTime + debounceDelay + requestDelay;
    var lastInput = 'lamb';

    var requestSuggestionsResponse = memo().is(function() {});

    titleInputs.is(function() {
      return [
        onNext(2, ''),
        onNext(firstInputDelay, 'l'),
        onNext(firstInputDelay + 2, 'la'),
        onNext(firstInputDelay + 4, 'lam'),
        onNext(lastInputDelay, lastInput),
      ];
    });

    beforeEach(function() {
      var suggestionsResponseObservable = scheduler.createColdObservable(requestSuggestionsResponse());
      requestSuggestions.and.returnValue(suggestionsResponseObservable);
    });

    afterEach(function() {
      expect(requestSuggestions.calls.count()).toEqual(1);
      expect(requestSuggestions).toHaveBeenCalledWith({
        title: lastInput,
        restaurantID: restaurantID,
      });
    });

    context('with request for getting suggestions failing', function() {
      var error = 'Error';
      requestSuggestionsResponse.is(function() {
        return [
          onError(requestDelay, error),
        ];
      });

      it('terminates with the error', function() {
        expect(suggestions()).toEqual([
          onError(suggestionTime, error),
        ]);
      });
    });

    context('with request for getting suggestions succeeding', function() {
      var responseSuggestions = [{
        title: 'Lambaliha & parmesaniga pasta',
      }];
      requestSuggestionsResponse.is(function() {
        return [
          onNext(requestDelay, {data: responseSuggestions}),
          onCompleted(requestDelay),
        ];
      });

      it('only requests the suggestions once (input is debounced)', function() {
        expect(suggestions()).toEqual([
          onNext(suggestionTime, responseSuggestions),
        ]);
      });
    });
  });

  context('with the title matching that of the only suggestion', function() {
    var inputDelay = 200;
    var requestDelay = 50;
    var title = 'Lambaliha & parmesaniga pasta';

    var requestSuggestionsResponse = [
      onNext(requestDelay, {data: [{
        title: title,
      }]}),
      onCompleted(requestDelay),
    ];

    titleInputs.is(function() {
      return [
        onNext(2, ''),
        onNext(inputDelay, title),
      ];
    });

    beforeEach(function() {
      var suggestionsResponseObservable = scheduler.createColdObservable(requestSuggestionsResponse);
      requestSuggestions.and.returnValue(suggestionsResponseObservable);
    });

    afterEach(function() {
      expect(requestSuggestions.calls.count()).toEqual(1);
      expect(requestSuggestions).toHaveBeenCalledWith({
        title: title,
        restaurantID: restaurantID,
      });
    });

    it("doesn't provide new suggestions", function() {
      expect(suggestions()).toEqual([]);
    });
  });
});
