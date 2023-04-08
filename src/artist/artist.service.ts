import { Inject, Injectable } from "@nestjs/common";

import { MetadataService } from "@metadata/metadata.service";

import { ConfigData } from "@config/config.module";
import { InjectConfig } from "@config/config.decorator";

import { Artist } from "@common/artist.dto";
import { ObjectService } from "@common/object.service";
import { ArtistAlbums } from "@common/artist-albums.dto";

import { CacheStorage } from "@utils/cache";
import { Nullable } from "@utils/types";

interface ArtistAlbumsCacheKey {
    artistId: string;
    skip?: number;
    limit?: number;
    locale?: string;
}

@Injectable()
export class ArtistService extends ObjectService<Artist, "artist"> {
    private readonly albumsCache = new CacheStorage<ArtistAlbumsCacheKey, Nullable<ArtistAlbums>>({
        keyBuilder: ({ artistId, skip, limit, locale }) => `${artistId}_${skip}_${limit}_${locale}`,
    });

    public constructor(
        @Inject(MetadataService) private readonly metadataService: MetadataService,
        @InjectConfig() private readonly configData: ConfigData,
    ) {
        super(metadataService, configData, "artist");
    }

    public async getArtistAlbums(
        artistId: string,
        skip?: number,
        limit?: number,
        locale?: string,
    ): Promise<Nullable<ArtistAlbums>> {
        const cacheKey = { artistId, skip, limit, locale };
        const cachedResult = this.albumsCache.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        const resolvers = this.metadataService.getResolvers();
        for (const [, resolver] of resolvers) {
            const rawId = resolver.getRawId(artistId);
            if (!rawId) {
                continue;
            }

            const albums = await resolver.getArtistAlbums(rawId, skip, limit, locale);
            this.albumsCache.set(cacheKey, albums);
            return albums;
        }

        throw new Error(`No suitable resolver found for artist id: ${artistId}`);
    }
}
