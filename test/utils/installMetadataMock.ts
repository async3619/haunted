import { ResolverPair } from "@metadata/resolvers";
import BaseResolver from "@metadata/resolvers/base";

import { MetadataService } from "@metadata/metadata.service";

export class MockResolver extends BaseResolver<"Mocked", any> {
    constructor() {
        super("Mocked", {});
    }

    public initialize = jest.fn();
    public fetchArtistAlbums = jest.fn().mockImplementation(() => ({ items: [], total: 0 }));
    public searchTrack = jest.fn().mockResolvedValue([]);
    public searchAlbum = jest.fn().mockResolvedValue([]);
    public searchArtist = jest.fn().mockResolvedValue([]);
    public getTracks = jest.fn().mockImplementation(ids => ids.map(id => ({ id })));
    public getAlbums = jest.fn().mockImplementation(ids => ids.map(id => ({ id })));
    public getArtists = jest.fn().mockImplementation(ids => ids.map(id => ({ id })));
}

export function installMetadataMock(metadataService: MetadataService) {
    const mockResolver = new MockResolver();
    const mockedResolvers = [["mocked", mockResolver] as unknown as ResolverPair];

    jest.spyOn(metadataService, "getResolvers").mockImplementation(() => mockedResolvers);

    return mockResolver;
}
