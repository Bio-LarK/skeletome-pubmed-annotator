'use strict';

describe('Service: pageService', function () {

  // load the service's module
  beforeEach(module('skeletomePubmedAnnotatorApp'));

  // instantiate service
  var pageService;
  beforeEach(inject(function (_pageService_) {
    pageService = _pageService_;
  }));

  it('should do something', function () {
    expect(!!pageService).toBe(true);
  });

});
