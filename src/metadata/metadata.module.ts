import { Module } from "@nestjs/common";

import { ConfigModule } from "@config/config.module";

import { MetadataService } from "@metadata/metadata.service";
import { MetadataResolver } from "@metadata/metadata.resolver";

@Module({
    imports: [ConfigModule],
    providers: [MetadataService, MetadataResolver],
    exports: [MetadataService],
})
export class MetadataModule {}
