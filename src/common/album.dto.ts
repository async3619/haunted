import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Image } from "@common/image.dto";
import { Track } from "@common/track.dto";

@ObjectType()
export class Album {
    @Field(() => String)
    public title!: string;

    @Field(() => [String])
    public artists!: string[];

    @Field(() => String)
    public releaseDate!: string;

    @Field(() => Int)
    public trackCount!: number;

    @Field(() => [Image])
    public albumArts!: Image[];

    @Field(() => [Track])
    public tracks!: Track[];
}
