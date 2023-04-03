import { MockResolver } from "@test/utils/installMetadataMock";

describe("BaseResolver", () => {
    let resolver: MockResolver;

    beforeEach(() => {
        resolver = new MockResolver();
    });

    it("should be able to get options", () => {
        expect(resolver.getOptions()).toEqual({});
    });
});
