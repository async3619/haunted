import { createIs } from "typia";

import { Field, ObjectType } from "@nestjs/graphql";

import { Image } from "@common/image.dto";
import { MediaItem, RootMediaItem } from "@common/media-item.dto";
import { ToRawType } from "@common/types";

@ObjectType()
export class Artist extends RootMediaItem {
    @Field(() => String)
    public name!: string;

    @Field(() => [Image])
    public artistImages!: Image[];
}

@ObjectType()
export class PartialArtist extends MediaItem {
    @Field(() => String)
    public name!: string;
}

export type RawArtist = ToRawType<Artist>;

export const isArtist = createIs<Artist>();
export const isArtistArray = createIs<Artist[]>();
export const isRawArtist = createIs<RawArtist>();
export const isRawArtistArray = createIs<RawArtist[]>();
