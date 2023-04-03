import { Field, ObjectType } from "@nestjs/graphql";

import { Track } from "@common/track.dto";
import { Artist } from "@common/artist.dto";
import { Album } from "@common/album.dto";

@ObjectType()
export class SearchResult {
    @Field(() => [Track])
    public tracks!: Track[];

    @Field(() => [Album])
    public albums!: Album[];

    @Field(() => [Artist])
    public artists!: Artist[];
}
