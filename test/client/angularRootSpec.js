describe('App', function() {
  'use strict';
  beforeEach(module('app'));

  it('should use main view template for offers route', inject(function($route) {
    expect($route.routes['/'].templateUrl).toEqual('src/mainView/mainView.html');
  }));

  it('should route to / on random address', inject(function($route) {
    expect($route.routes[null].redirectTo).toEqual('/');
  }));
});
