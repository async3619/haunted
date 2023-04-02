import { buildSchema } from "type-graphql";
import type { GraphQLSchema } from "graphql/type";
import http from "http";
import express from "express";
import * as fs from "fs-extra";
import { printSchema } from "graphql";

import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";

import { ResolverPair } from "@resolver";
import BaseServer from "@server/base";
import GraphQLResolver from "@server/graphql/resolver";

export interface GraphQLServerOptions {
    port: number;
    playground?: boolean;
}

export interface GraphQLContext {
    resolvers: ReadonlyArray<ResolverPair>;
}

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
            resolvers: [GraphQLResolver],
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

        if (process.env.NODE_ENV === "development") {
            const schema = this.schema;

            await this.logger.task({
                message: "Writing GraphQL schema to file",
                level: "debug",
                task: async () => {
                    const rawSchema = printSchema(schema);
                    await fs.writeFile("schema.graphqls", rawSchema);
                },
            });
        }

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
}
