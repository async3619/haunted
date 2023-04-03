import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Image {
    @Field(() => String)
    public url!: string;

    @Field(() => Int, { nullable: true })
    public width?: number;

    @Field(() => Int, { nullable: true })
    public height?: number;
}
