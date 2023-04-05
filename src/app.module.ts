import * as path from "path";

import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

import { ConfigModule } from "@config/config.module";
import { MetadataModule } from "@metadata/metadata.module";
import { AlbumModule } from "@album/album.module";
import { TrackModule } from "@track/track.module";
import { ArtistModule } from "@artist/artist.module";
import { TRPCServerModule } from "@trpc-server/trpc-server.module";

@Module({
    imports: [
        ConfigModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: process.env.NODE_ENV === "development",
            autoSchemaFile: path.join(process.cwd(), "schema.graphqls"),
            path: "/",
        }),
        TRPCServerModule,
        MetadataModule,
        AlbumModule,
        TrackModule,
        ArtistModule,
    ],
})
export class AppModule {}
