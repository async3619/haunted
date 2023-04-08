import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class GetItemInput {
    @Field(() => String)
    public id!: string;

    @Field(() => String, { nullable: true })
    public locale?: string;
}
