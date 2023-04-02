import { AsyncFn, Fn } from "@utils/types";

export default async function iterate<TItem, TData>(
    items: ReadonlyArray<TItem>,
    callback: AsyncFn<TItem, TData> | Fn<TItem, TData>,
): Promise<TData[]> {
    const results: TData[] = [];
    for (const item of items) {
        const data = await callback(item);
        results.push(data);
    }

    return results;
}
