import { Max, Min } from "class-validator";

import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchInput {
    @Field(() => String)
    public query!: string;

    @Field(() => Int, { nullable: true })
    @Min(1)
    @Max(20)
    public limit?: number;

    @Field(() => String, { nullable: true })
    public locale?: string;
}
