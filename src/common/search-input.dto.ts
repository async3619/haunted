import { Max } from "class-validator";

import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchInput {
    @Field(() => String)
    public query!: string;

    @Max(20)
    @Field(() => Int, { nullable: true })
    public limit?: number;

    @Field(() => String, { nullable: true })
    public locale?: string;
}
