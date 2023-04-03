import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class SearchInput {
    @Field(() => String)
    public query!: string;

    @Field(() => Int, { nullable: true })
    public limit?: number;
}
