import _ from "lodash";

import { ResolverPair } from "@resolver";

import { Loggable } from "@utils/loggable";

export default abstract class BaseServer<
    TType extends string,
    TOptions extends Record<string, any>,
> extends Loggable<TType> {
    protected readonly options: TOptions;
    protected readonly resolvers: ReadonlyArray<ResolverPair>;

    protected constructor(name: TType, options: TOptions, resolvers: ReadonlyArray<ResolverPair>) {
        super(name);

        this.options = options;
        this.resolvers = resolvers;
    }

    public getOptions() {
        return _.cloneDeep(this.options);
    }

    public abstract isRunning(): boolean;
    public abstract start(): Promise<void>;
    public abstract stop(): Promise<void>;

    public async run() {
        await this.start();

        this.logger.info(`Server started on port {yellow}`, [this.options.port]);
    }
}
