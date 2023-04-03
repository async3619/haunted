import * as path from "path";

import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";

import { ConfigModule } from "@config/config.module";
import { MetadataModule } from "@metadata/metadata.module";
import { AlbumModule } from "@album/album.module";
import { TrackModule } from "@track/track.module";
import { ArtistModule } from "@artist/artist.module";

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            playground: process.env.NODE_ENV === "development",
            autoSchemaFile: path.join(process.cwd(), "schema.graphqls"),
            path: "/",
        }),
        ConfigModule,
        MetadataModule,
        AlbumModule,
        TrackModule,
        ArtistModule,
    ],
})
export class AppModule {}
