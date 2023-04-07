import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class GetItemInput {
    @Field(() => String)
    public id!: string;

    @Field(() => String, { nullable: true })
    public locale?: string;
}
