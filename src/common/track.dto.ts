import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Track {
    @Field(() => String)
    public title!: string;

    @Field(() => [String])
    public artists!: string[];

    @Field(() => String)
    public album!: string;

    @Field(() => String)
    public albumArtists!: string[];

    @Field(() => Int)
    public duration!: number;

    @Field(() => Int)
    public track!: number;

    @Field(() => Int)
    public disc!: number;

    @Field(() => String)
    public year!: string;
}
