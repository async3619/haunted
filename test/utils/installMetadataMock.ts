import { ResolverPair } from "@metadata/resolvers";
import BaseResolver from "@metadata/resolvers/base";

import { MetadataService } from "@metadata/metadata.service";

export class MockResolver extends BaseResolver<"Mocked", any> {
    constructor() {
        super("Mocked", {});
    }

    public initialize = jest.fn();
    public search = jest.fn().mockResolvedValue({ albums: [], tracks: [], artists: [] });
    public searchTrack = jest.fn().mockResolvedValue([]);
    public searchAlbum = jest.fn().mockResolvedValue([]);
    public searchArtist = jest.fn().mockResolvedValue([]);
}

export function installMetadataMock(metadataService: MetadataService) {
    const mockResolver = new MockResolver();
    jest.spyOn(metadataService, "getResolvers").mockImplementation(() => {
        return [["mocked", mockResolver] as unknown as ResolverPair];
    });

    return mockResolver;
}
