import { Arg, buildSchema, Ctx, Query, Resolver } from "type-graphql";
import type { GraphQLSchema } from "graphql/type";
import http from "http";
import express from "express";

import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";

import { ResolverPair } from "@resolver";
import BaseServer from "@server/base";

import iterate from "@utils/iterate";
import { Album, Artist, Music, SearchInput, SearchOutput } from "@utils/types";

export interface GraphQLServerOptions {
    port: number;
    playground?: boolean;
}

export interface GraphQLContext {
    resolvers: ReadonlyArray<ResolverPair>;
}

@Resolver()
export default class GraphQLServer extends BaseServer<"GraphQL", GraphQLServerOptions> {
    private schema: GraphQLSchema | null = null;

    private express: express.Express | null = null;
    private server: http.Server | null = null;
    private apolloServer: ApolloServer | null = null;

    public constructor(options: GraphQLServerOptions, resolvers: ReadonlyArray<ResolverPair>) {
        super("GraphQL", options, resolvers);
    }

    public isRunning(): boolean {
        return !!this.server && this.server.listening;
    }

    public async start(): Promise<void> {
        this.schema = await buildSchema({
            resolvers: [GraphQLServer],
            validate: {
                forbidUnknownValues: false,
            },
        });

        this.express = express();
        this.server = http.createServer(this.express);

        this.apolloServer = new ApolloServer({
            schema: this.schema,
            context: () => ({ resolvers: this.resolvers }),
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer: this.server })],
        });

        await this.apolloServer.start();
        this.apolloServer.applyMiddleware({ app: this.express, path: "/" });

        const httpServer = this.server;
        return new Promise<void>(resolve => httpServer.listen({ port: this.options.port }, resolve));
    }
    public async stop(): Promise<void> {
        const server = this.server;
        if (!server) {
            throw new Error("GraphQLServer has not been started yet");
        }

        return new Promise<void>(resolve => {
            server.close(() => {
                resolve();
            });
        });
    }

    @Query(() => [Music])
    private async searchMusics(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<Music[]> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchMusics(input.query, input.limit),
        );

        return result.flatMap(musics => musics);
    }
    @Query(() => [Album])
    private async searchAlbums(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<Album[]> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchAlbums(input.query, input.limit),
        );

        return result.flatMap(albums => albums);
    }
    @Query(() => [Artist])
    private async searchArtists(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<Artist[]> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchArtists(input.query, input.limit),
        );

        return result.flatMap(artists => artists);
    }
    @Query(() => SearchOutput)
    private async search(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<SearchOutput> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.search(input.query, input.limit),
        );

        return {
            musics: result.flatMap(item => item.musics),
            albums: result.flatMap(item => item.albums),
            artists: result.flatMap(item => item.artists),
        };
    }
}
