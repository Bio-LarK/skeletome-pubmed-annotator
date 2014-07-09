'use strict';

describe('Directive: annotator', function () {

  // load the directive's module
  beforeEach(module('skeletomePubmedAnnotatorApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<annotator></annotator>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the annotator directive');
  }));
});
