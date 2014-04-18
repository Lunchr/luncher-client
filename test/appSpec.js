describe('PraadApp', function() {
  'use strict';
  beforeEach(module('praadApp'));

  it('should use main view template for offers route', inject(function($route) {
    expect($route.routes['/offers'].templateUrl).toEqual('partials/mainView.html');
  }));

  it('should route to /offers on random address', inject(function($route) {
    expect($route.routes[null].redirectTo).toEqual('/offers');
  }));
});
