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

    it("should be able to set and get multiple values", () => {
        const cache = new CacheStorage<string, number>();
        cache.setMany([
            ["test", 1],
            ["test2", 2],
        ]);

        expect(cache.length).toBe(2);
        expect(cache.getMany(["test", "test2"])).toEqual([1, 2]);
    });

    it("should be able to get multiple values with undefined", () => {
        const cache = new CacheStorage<string, number>();
        cache.setMany([
            ["test", 1],
            ["test2", 2],
        ]);

        expect(cache.length).toBe(2);
        expect(cache.getMany(["test", "test3"])).toEqual([1, undefined]);
    });

    it("should throw error if given key is not found", () => {
        const cache = new CacheStorage<string, number>();
        cache.set("test", 1);
        cache.set("test2", 2);

        expect(() => cache.getOrThrow("test")).not.toThrow();
        expect(() => cache.getManyOrThrow(["test", "test2"])).not.toThrow();

        expect(() => cache.getOrThrow("test3")).toThrow();
        expect(() => cache.getManyOrThrow(["test3", "test"])).toThrow();
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

        expect(cache.get("test3")).toBe(undefined);
    });

    it("should be able to set time to live", async () => {
        const cache = new CacheStorage<string, number>();
        cache.setTimeToLive(1);
        expect(cache["timeToLive"]).toBe(1);

        cache.set("test", 1);
        expect(cache.exists("test")).toBe(true);

        await sleep(2000);
        expect(cache.exists("test")).toBe(false);
    });

    it("should throw if time to life is invalid", () => {
        const cache = new CacheStorage<string, number>();
        expect(() => cache.setTimeToLive(0)).toThrow();
        expect(() => cache.setTimeToLive(-1)).toThrow();
        expect(() => new CacheStorage<string, number>({ timeToLive: 0 })).toThrow();
        expect(() => new CacheStorage<string, number>({ timeToLive: -1 })).toThrow();
    });
});
