import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class GetItemsInput {
    @Field(() => [String])
    public ids!: string[];

    @Field(() => String, { nullable: true })
    public locale?: string;
}
