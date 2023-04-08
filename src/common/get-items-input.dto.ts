import { Field, ArgsType } from "@nestjs/graphql";

@ArgsType()
export class GetItemsInput {
    @Field(() => [String])
    public ids!: string[];

    @Field(() => String, { nullable: true })
    public locale?: string;
}
