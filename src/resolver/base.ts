import _ from "lodash";
import { ReadonlyDeep } from "type-fest";

import { Loggable } from "@utils/loggable";
import { SearchOutput } from "@utils/types";

export default abstract class BaseResolver<
    TType extends string,
    TOptions extends Record<string, any>,
> extends Loggable<TType> {
    private readonly options: ReadonlyDeep<TOptions>;

    protected constructor(name: TType, options: ReadonlyDeep<TOptions>) {
        super(name);

        this.options = options;
    }

    public getOptions() {
        return _.cloneDeep(this.options);
    }

    public abstract initialize(): Promise<void>;
    public abstract search(query: string, limit?: number): Promise<SearchOutput>;
}
