import * as path from "path";

import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

import { ConfigData, ConfigModule } from "@config/config.module";
import { CONFIG_DATA } from "@config/config.decorator";

import { MetadataModule } from "@metadata/metadata.module";
import { AlbumModule } from "@album/album.module";
import { TrackModule } from "@track/track.module";
import { ArtistModule } from "@artist/artist.module";
import { TRPCServerModule } from "@trpc-server/trpc-server.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [ConfigModule.forFeature()],
            inject: [CONFIG_DATA],
            useFactory: async (configData: ConfigData) => ({
                playground: process.env.NODE_ENV === "development",
                autoSchemaFile: path.join(process.cwd(), "schema.graphqls"),
                path: configData?.servers?.graphql?.path || "/graphql",
            }),
        }),
        TRPCServerModule,
        MetadataModule,
        AlbumModule,
        TrackModule,
        ArtistModule,
    ],
})
export class AppModule {}
