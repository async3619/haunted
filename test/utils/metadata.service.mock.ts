import { MetadataService } from "@metadata/metadata.service";

import { MockResolver } from "@test/utils/installMetadataMock";
import { ResolverPair } from "@metadata/resolvers";

export class MetadataServiceMock extends MetadataService {
    public readonly sampleResolver = new MockResolver();

    public constructor() {
        super({} as any);
    }

    public getResolvers(): ResolverPair[] {
        return [["mock" as any, this.sampleResolver]];
    }
}
