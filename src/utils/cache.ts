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
    private readonly timeToLive: number;

    public constructor(options?: CacheStorageOptions<TKey>) {
        const { keyBuilder, timeToLive = 3600 } = options || {};

        this.keyBuilder = keyBuilder || ((key: TKey) => `${key}`);
        this.timeToLive = timeToLive;
    }

    public get length() {
        return this.container.size;
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
    public get(key: TKey): TValue | null {
        return this.getItem(key)?.value || null;
    }
    public exists(key: TKey) {
        return !!this.getItem(key);
    }

    public clear() {
        this.container.clear();
    }
    public delete(key: TKey) {
        const keyString = this.keyBuilder(key);
        return this.container.delete(keyString);
    }
}
