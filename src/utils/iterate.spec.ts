import iterate from "@utils/iterate";

describe("iterate", () => {
    it("should be able to iterate over an array", async () => {
        const items = [1, 2, 3];
        const results = await iterate(items, async item => item * 2);
        expect(results).toEqual([2, 4, 6]);
    });
});
