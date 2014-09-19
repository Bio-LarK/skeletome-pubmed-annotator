'use strict';

describe('Service: externalidentifier', function () {

  // load the service's module
  beforeEach(module('skeletomePubmedAnnotatorApp'));

  // instantiate service
  var externalidentifier;
  beforeEach(inject(function (_externalidentifier_) {
    externalidentifier = _externalidentifier_;
  }));

  it('should do something', function () {
    expect(!!externalidentifier).toBe(true);
  });

});
