'use strict';

describe('Service: searchbar', function () {

    // load the service's module
    beforeEach(module('skeletomePubmedAnnotatorApp'));

    // instantiate service
    var searchbar;
    beforeEach(inject(function (_searchbar_) {
        searchbar = _searchbar_;
    }));

    it('should do something', function () {
        expect(!!searchbar).toBe(true);
    });

});