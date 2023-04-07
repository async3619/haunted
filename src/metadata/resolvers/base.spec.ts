import { MockResolver } from "@test/utils/installMetadataMock";

describe("BaseResolver", () => {
    let resolver: MockResolver;

    beforeEach(() => {
        resolver = new MockResolver();
    });

    it("should be able to get options", () => {
        expect(resolver.getOptions()).toEqual({});
    });

    it("should return null if given id is not for this resolver", () => {
        expect(resolver.getRawId("test")).toBeNull();
        expect(resolver.getRawId("mocked::test")).toBe("test");
    });

    it("should throw error if given search type is unknown", () => {
        expect(resolver.search({ query: "" }, "test" as any)).rejects.toThrow("Unknown type:");
    });

    it("should throw error if given get items type is unknown", () => {
        expect(resolver.getItems(["test"], "test" as any)).rejects.toThrow("Unknown type:");
    });
});
