import BaseResolver from "@resolver/base";
import SpotifyResolver from "@resolver/spotify";

export type ResolverClasses = SpotifyResolver;
export type ResolverTypes = Lowercase<ResolverClasses["name"]>;

export type OptionMap<T extends BaseResolver<string, Record<string, any>>> = {
    [TKey in T["name"] as Lowercase<TKey>]: TKey extends T["name"]
        ? ReturnType<Extract<T, { name: TKey }>["getOptions"]>
        : never;
};

export type ResolverOptions = ResolverClasses["options"];
export type ResolverOptionsMap = OptionMap<ResolverClasses>;

export type ResolverMap = {
    [TKey in ResolverTypes]: TKey extends ResolverTypes ? Extract<ResolverClasses, { name: Capitalize<TKey> }> : never;
};
export type ResolverFactoryMap = {
    [TKey in ResolverTypes]: TKey extends ResolverTypes
        ? (options: ResolverOptionsMap[TKey]) => Extract<ResolverClasses, { name: Capitalize<TKey> }>
        : never;
};
export type ResolverPair = [ResolverTypes, BaseResolver<string, ResolverOptions>];

const AVAILABLE_RESOLVERS: Readonly<ResolverFactoryMap> = {
    spotify: options => new SpotifyResolver(options),
};

export const createResolver = (
    type: ResolverTypes,
    options: ResolverOptions,
): BaseResolver<string, ResolverOptions> => {
    return AVAILABLE_RESOLVERS[type](options);
};
