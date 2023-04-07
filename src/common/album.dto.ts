import { Field, Int, ObjectType } from "@nestjs/graphql";

import { MediaItem, RootMediaItem } from "@common/media-item.dto";
import { PartialArtist } from "@common/artist.dto";
import { Image } from "@common/image.dto";

import { ToRawType } from "@common/types";

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

    @Field(() => String)
    public releaseDate!: string;

    @Field(() => Int)
    public trackCount!: number;

    @Field(() => [Image])
    public albumArts!: Image[];

    @Field(() => [AlbumTrack])
    public tracks!: AlbumTrack[];
}

export type RawAlbum = ToRawType<Album>;
