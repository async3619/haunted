import { CacheStorage } from "@utils/cache";
import { sleep } from "@utils/sleep";

describe("Cache", () => {
    it("should be able to get length", () => {
        const cache = new CacheStorage<string, number>();

        expect(cache.length).toBe(0);

        cache.set("test", 1);
        cache.set("test2", 2);

        expect(cache.length).toBe(2);
    });

    it("should be able to set and get values", () => {
        const cache = new CacheStorage<string, number>();
        cache.set("test", 1);
        cache.set("test2", 2);

        expect(cache.length).toBe(2);

        expect(cache.get("test")).toBe(1);
        expect(cache.get("test2")).toBe(2);
    });

    it("should be able to determine if item is alive", () => {
        const cache = new CacheStorage<string, number>();
        cache.set("test", 1);

        expect(cache.exists("test")).toBe(true);
    });

    it("should be able to invalidate item after time to live", async () => {
        const cache = new CacheStorage<string, number>({ timeToLive: 2 });
        cache.set("test", 1);

        expect(cache.exists("test")).toBe(true);

        await sleep(3000);

        expect(cache.exists("test")).toBe(false);
    });

    it("should be able to delete item", () => {
        const cache = new CacheStorage<string, number>();
        cache.set("test", 1);

        expect(cache.exists("test")).toBe(true);

        cache.delete("test");

        expect(cache.exists("test")).toBe(false);
    });

    it("should be able to delete all items", () => {
        const cache = new CacheStorage<string, number>();
        cache.set("test", 1);
        cache.set("test2", 2);

        expect(cache.exists("test")).toBe(true);
        expect(cache.exists("test2")).toBe(true);

        cache.clear();

        expect(cache.exists("test")).toBe(false);
        expect(cache.exists("test2")).toBe(false);
    });

    it("should return null if item is not found", () => {
        const cache = new CacheStorage<string, number>();
        cache.set("test", 1);
        cache.set("test2", 2);

        expect(cache.get("test3")).toBe(null);
    });
});
