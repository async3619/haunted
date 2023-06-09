import { ObjectService } from "@common/object.service";
import { ConfigData, DEFAULT_CONFIG } from "@config/config.module";

import { MetadataServiceMock } from "@test/utils/metadata.service.mock";

class MockService extends ObjectService<any, "artist"> {
    public constructor(config: ConfigData = DEFAULT_CONFIG) {
        super(new MetadataServiceMock(), config, "artist");
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
        const service = new MockService({ cacheTTL: 1000, resolvers: {} });
        await service.onModuleInit();

        expect(service["searchCache"]["timeToLive"]).toBe(1000);
    });

    it("should not set cache TTL on module initialization if it is not defined", async () => {
        const service = new MockService();
        await service.onModuleInit();

        expect(service["searchCache"]["timeToLive"]).toBe(3600);
    });

    it("should return cached results for searching if they are available", async () => {
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

    it("should return cached results for resolving items if they are available", async () => {
        const service = new MockService();
        const [left] = await service.getItems(["mocked::test"], "en");
        const right = await service.getItem("mocked::test", "en");
        const [right2] = await service.getItems(["mocked::test"], "en");

        expect(left === right).toBe(true);
        expect(left === right2).toBe(true);
    });

    it("should return null if given id is not valid for any resolver", async () => {
        const service = new MockService();
        const result = await service.getItem("test", "en");

        expect(result).toBeNull();
    });
});
