import { Field, ObjectType } from "@nestjs/graphql";
import { Image } from "@common/image.dto";

@ObjectType()
export class Artist {
    @Field(() => String)
    public name!: string;

    @Field(() => [Image])
    public artistImages!: Image[];
}
