import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({ isAbstract: true })
export class MediaItem {
    @Field(() => String)
    public id!: string;
}

@ObjectType({ isAbstract: true })
export class RootMediaItem extends MediaItem {
    @Field(() => String)
    public serviceName!: string;
}
