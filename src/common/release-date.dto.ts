import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Nullable } from "@utils/types";

@ObjectType()
export class ReleaseDate {
    @Field(() => Int)
    public year!: number;

    @Field(() => Int, { nullable: true })
    public month!: Nullable<number>;

    @Field(() => Int, { nullable: true })
    public day!: Nullable<number>;

    @Field(() => Int)
    public timestamp!: number;
}
