import { Module } from "@nestjs/common";

import { ConfigModule } from "@config/config.module";

import { MetadataService } from "@metadata/metadata.service";

@Module({
    imports: [ConfigModule.forFeature()],
    providers: [MetadataService],
    exports: [MetadataService],
})
export class MetadataModule {}
