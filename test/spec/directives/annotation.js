'use strict';

describe('Directive: annotation', function () {

  // load the directive's module
  beforeEach(module('skeletomePubmedAnnotatorApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<annotation></annotation>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the annotation directive');
  }));
});
