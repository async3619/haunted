import { createIs } from "typia";

import { Field, Int, ObjectType } from "@nestjs/graphql";

import { MediaItem, RootMediaItem } from "@common/media-item.dto";
import { PartialArtist } from "@common/artist.dto";
import { Image } from "@common/image.dto";
import { ReleaseDate } from "@common/release-date.dto";

import { ToRawType } from "@common/types";
import { Nullable } from "@utils/types";

@ObjectType()
export class AlbumTrack extends MediaItem {
    @Field(() => String)
    public title!: string;

    @Field(() => Int)
    public duration!: number;

    @Field(() => Int)
    public track!: number;

    @Field(() => Int)
    public disc!: number;

    @Field(() => String)
    public year!: string;

    @Field(() => [PartialArtist])
    public artists!: PartialArtist[];
}

@ObjectType()
export class Album extends RootMediaItem {
    @Field(() => String)
    public title!: string;

    @Field(() => [PartialArtist])
    public artists!: PartialArtist[];

    @Field(() => ReleaseDate, { nullable: true })
    public releaseDate!: Nullable<ReleaseDate>;

    @Field(() => Int)
    public trackCount!: number;

    @Field(() => [Image])
    public albumArts!: Image[];

    @Field(() => [AlbumTrack])
    public tracks!: AlbumTrack[];
}

export type RawAlbum = ToRawType<Album>;

export const isAlbum = createIs<Album>();
export const isAlbumArray = createIs<Album[]>();
export const isRawAlbum = createIs<RawAlbum>();
export const isRawAlbumArray = createIs<RawAlbum[]>();
