'use strict';

describe('Controller: PubmedCtrl', function () {

  // load the controller's module
  beforeEach(module('skeletomePubmedAnnotatorApp'));

  var PubmedCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PubmedCtrl = $controller('PubmedCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
