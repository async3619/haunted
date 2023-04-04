import { ObjectService } from "@common/object.service";

import { MetadataServiceMock } from "@test/utils/metadata.service.mock";

class MockService extends ObjectService<any> {
    public constructor() {
        super(new MetadataServiceMock(), async () => [{ test: "value" }]);
    }
}

describe("ObjectService", () => {
    it("should able to cache results", async () => {
        const service = new MockService();
        await service.search({
            query: "test",
            locale: "en",
            limit: 10,
        });

        expect(service["searchCache"].length).toBe(1);
    });

    it("should return cached results if they are available", async () => {
        const service = new MockService();
        const left = await service.search({
            query: "test",
            locale: "en",
            limit: 10,
        });

        const right = await service.search({
            query: "test",
            locale: "en",
            limit: 10,
        });

        expect(left[0] === right[0]).toBe(true);
    });
});
