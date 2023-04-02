import { Field, InputType, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Music {
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

    @Field(() => Int)
    public year!: number;
}

@ObjectType()
export class Image {
    @Field(() => String)
    public url!: string;

    @Field(() => Int, { nullable: true })
    public width?: number;

    @Field(() => Int, { nullable: true })
    public height?: number;
}

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
}

@ObjectType()
export class Artist {
    @Field(() => String)
    public name!: string;

    @Field(() => [Image])
    public artistImages!: Image[];
}

@InputType()
export class SearchInput {
    @Field(() => String)
    public query!: string;

    @Field(() => Int, { nullable: true })
    public limit?: number;
}

export type SearchMusicsOutput = Music[];
export type SearchAlbumsOutput = Album[];
export type SearchArtistsOutput = Artist[];

@ObjectType()
export class SearchOutput {
    @Field(() => [Music])
    public musics!: SearchMusicsOutput;

    @Field(() => [Album])
    public albums!: SearchAlbumsOutput;

    @Field(() => [Artist])
    public artists!: SearchArtistsOutput;
}

export type Fn<TArgs = void, TReturn = void> = TArgs extends void
    ? () => TReturn
    : TArgs extends any[]
    ? (...args: TArgs) => TReturn
    : (args: TArgs) => TReturn;
export type AsyncFn<TArgs = void, TReturn = void> = Fn<TArgs, Promise<TReturn>>;
