import { IsOptional, Max, Min } from "class-validator";

import { ArgsType, Field, Int } from "@nestjs/graphql";

@ArgsType()
export class ArtistAlbumsInput {
    @Field(() => Int, { nullable: true })
    public offset?: number;

    /**
     * Limit the number of results
     *
     * @minimum 1
     * @maximum 20
     */
    @Field(() => Int, { nullable: true })
    @Min(1)
    @Max(20)
    @IsOptional()
    public limit?: number;

    @Field(() => String, { nullable: true })
    public locale?: string;
}

@ArgsType()
export class RootArtistAlbumsInput extends ArtistAlbumsInput {
    @Field(() => String)
    public artistId!: string;
}
