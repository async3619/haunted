import { ObjectService } from "@common/object.service";
import { ConfigService } from "@config/config.service";

import { MetadataServiceMock } from "@test/utils/metadata.service.mock";

class MockService extends ObjectService<any> {
    public constructor() {
        super(new MetadataServiceMock(), new ConfigService(), async () => [{ test: "value" }]);
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

    it("should set cache TTL on module initialization", async () => {
        const service = new MockService();
        Object.defineProperty(service["config"], "getConfig", {
            value: () => ({ cacheTTL: 1000 }),
        });

        await service.onModuleInit();

        expect(service["searchCache"]["timeToLive"]).toBe(1000);
    });

    it("should not set cache TTL on module initialization if it is not defined", async () => {
        const service = new MockService();
        Object.defineProperty(service["config"], "getConfig", {
            value: () => ({}),
        });

        await service.onModuleInit();

        expect(service["searchCache"]["timeToLive"]).toBe(3600);
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
