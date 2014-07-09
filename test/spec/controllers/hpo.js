'use strict';

describe('Controller: HpoCtrl', function () {

  // load the controller's module
  beforeEach(module('skeletomePubmedAnnotatorApp'));

  var HpoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    HpoCtrl = $controller('HpoCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
