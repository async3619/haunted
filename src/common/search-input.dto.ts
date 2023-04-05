import { IsOptional, Max, Min } from "class-validator";

import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchInput {
    @Field(() => String)
    public query!: string;

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
