import { ResolverPair } from "@resolver";

import BaseServer from "@server/base";
import TRPCServer from "@server/trpc";
import GraphQLServer from "@server/graphql";

export type ServerClasses = TRPCServer | GraphQLServer;
export type ServerTypes = Lowercase<ServerClasses["name"]>;

export type OptionMap<T extends BaseServer<string, Record<string, any>>> = {
    [TKey in T["name"] as Lowercase<TKey>]: TKey extends T["name"]
        ? ReturnType<Extract<T, { name: TKey }>["getOptions"]>
        : never;
};

export type ServerOptions = ServerClasses["options"];
export type ServerOptionsMap = OptionMap<ServerClasses>;

export type ServerMap = {
    [TKey in ServerClasses["name"] as Lowercase<TKey>]: TKey extends ServerClasses["name"]
        ? Extract<ServerClasses, { name: TKey }>
        : never;
};
export type ServerFactoryMap = {
    [TKey in ServerClasses["name"] as Lowercase<TKey>]: TKey extends ServerClasses["name"]
        ? (
              options: ServerOptionsMap[Lowercase<TKey>],
              resolvers: ReadonlyArray<ResolverPair>,
          ) => Extract<ServerClasses, { name: TKey }>
        : never;
};
export type ServerPair = [ServerTypes, BaseServer<string, ServerOptions>];

const AVAILABLE_SERVERS: Readonly<ServerFactoryMap> = {
    graphql: (options, resolvers) => new GraphQLServer(options, resolvers),
    trpc: (options, resolvers) => new TRPCServer(options, resolvers),
};

export const createServer = (
    type: ServerTypes,
    options: ServerOptions,
    resolvers: ReadonlyArray<ResolverPair>,
): BaseServer<string, ServerOptions> => {
    return AVAILABLE_SERVERS[type](options, resolvers);
};
