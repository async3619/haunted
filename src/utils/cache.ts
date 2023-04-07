import { Fn } from "@utils/types";

interface CacheItem<TKey, TValue> {
    key: TKey;
    value: TValue;
    createdAt: number;
}

export interface CacheStorageOptions<TKey> {
    keyBuilder?: Fn<[TKey], string>;
    timeToLive?: number; // in seconds
}

export class CacheStorage<TKey, TValue> {
    private readonly container = new Map<string, CacheItem<TKey, TValue>>();
    private readonly keyBuilder: Fn<[TKey], string>;
    private timeToLive: number;

    public constructor(options?: CacheStorageOptions<TKey>) {
        const { keyBuilder, timeToLive = 3600 } = options || {};
        if (timeToLive <= 0) {
            throw new Error("Time to live must be greater than 0");
        }

        this.keyBuilder = keyBuilder || ((key: TKey) => `${key}`);
        this.timeToLive = timeToLive;
    }

    public get length() {
        return this.container.size;
    }

    public setTimeToLive(timeToLive: number) {
        if (timeToLive <= 0) {
            throw new Error("Time to live must be greater than 0");
        }

        this.timeToLive = timeToLive;
    }

    private isAlive(item: CacheItem<TKey, TValue>) {
        const now = Date.now();
        const diff = now - item.createdAt;

        return diff <= this.timeToLive * 1000;
    }
    private getItem(key: TKey) {
        const keyString = this.keyBuilder(key);
        const item = this.container.get(keyString);
        if (!item) {
            return null;
        }

        if (!this.isAlive(item)) {
            this.delete(key);
            return null;
        }

        return item;
    }

    public set(key: TKey, value: TValue) {
        const item: CacheItem<TKey, TValue> = {
            key,
            value,
            createdAt: Date.now(),
        };

        this.container.set(this.keyBuilder(key), item);

        return item;
    }
    public setMany(items: [TKey, TValue][]) {
        return items.map(([key, value]) => this.set(key, value));
    }

    public get(key: TKey): TValue | null {
        return this.getItem(key)?.value || null;
    }
    public getOrThrow(key: TKey): TValue {
        const value = this.get(key);
        if (!value) {
            throw new Error(`Cache item with key ${key} not found`);
        }

        return value;
    }
    public getMany(keys: TKey[]): (TValue | null)[] {
        return keys.map(key => this.get(key));
    }
    public getManyOrThrow(keys: TKey[]): TValue[] {
        return keys.map(key => this.getOrThrow(key));
    }

    public exists(key: TKey) {
        return !!this.getItem(key);
    }
    public has(key: TKey) {
        return this.exists(key);
    }

    public clear() {
        this.container.clear();
    }
    public delete(key: TKey) {
        const keyString = this.keyBuilder(key);
        return this.container.delete(keyString);
    }
}
