'use strict';

describe('Service: searchterms', function () {

    // load the service's module
    beforeEach(module('skeletomePubmedAnnotatorApp'));

    // instantiate service
    var searchterms;
    beforeEach(inject(function (_searchterms_) {
        searchterms = _searchterms_;
    }));

    it('should do something', function () {
        expect(!!searchterms).toBe(true);
    });

});