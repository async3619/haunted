import dayjs from "dayjs";
import { AsyncFn } from "@utils/types";

interface SucceededMeasureTimeResult<T> {
    readonly elapsedTime: number;
    readonly data: T;
}

interface FailedMeasureTimeResult {
    readonly elapsedTime: number;
    readonly exception: Error;
}

export type MeasureTimeResult<T> = SucceededMeasureTimeResult<T> | FailedMeasureTimeResult;

export default async function measureTime<T>(task: AsyncFn<void, T>): Promise<MeasureTimeResult<T>> {
    const startedAt = dayjs();
    try {
        const result = await task();

        return {
            elapsedTime: dayjs().diff(startedAt),
            data: result,
        };
    } catch (e) {
        return {
            elapsedTime: dayjs().diff(startedAt),
            exception: e as Error,
        };
    }
}
