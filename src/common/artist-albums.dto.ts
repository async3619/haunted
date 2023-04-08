import { createIs } from "typia";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Album } from "@common/album.dto";
import { ToRawType } from "@common/types";

@ObjectType()
export class ArtistAlbums {
    @Field(() => Int)
    public total!: number;

    @Field(() => [Album])
    public items!: Album[];
}

export type RawArtistAlbums = ToRawType<ArtistAlbums>;

export const isArtistAlbums = createIs<ArtistAlbums>();
