import { is } from "typia";
import SpotifyWebApi from "spotify-web-api-node";

import BaseResolver from "@metadata/resolvers/base";

import { isRawAlbum, RawAlbum } from "@common/album.dto";
import { RawArtistAlbums } from "@common/artist-albums.dto";
import { SearchInput } from "@common/search-input.dto";

import { JsonResponse, Request } from "@utils/request";
import { Nullable } from "@utils/types";
import dayjs from "dayjs";
import { RawTrack } from "@common/track.dto";
import { RawArtist } from "@common/artist.dto";

export interface SpotifyResolverOptions {
    clientId: string;
    clientSecret: string;
}

interface ErrorResponse {
    error: {
        status: number;
        message: string;
    };
}

type SearchType = Parameters<typeof SpotifyWebApi.prototype.search>[1][0];

interface ApiParameters {
    "/v1/search": (params: {
        q: string;
        type: SearchType[];
        limit?: number;
        locale?: string;
    }) => SpotifyApi.SearchResponse;
    "/v1/albums": (params: { ids: string[]; locale?: string }) => SpotifyApi.MultipleAlbumsResponse;
    "/v1/artists": (params: { ids: string[]; locale?: string }) => SpotifyApi.MultipleArtistsResponse;
    "/v1/tracks": (params: { ids: string[]; locale?: string }) => SpotifyApi.MultipleTracksResponse;
    "/v1/artists/{id}/albums": (params: {
        id: string;
        limit?: number;
        offset?: number;
        locale?: string;
    }) => SpotifyApi.ArtistsAlbumsResponse;
}

export class SpotifyResolver extends BaseResolver<"Spotify", SpotifyResolverOptions> {
    private readonly client: SpotifyWebApi;

    public constructor(options: SpotifyResolverOptions) {
        super("Spotify", options);

        this.client = new SpotifyWebApi({
            clientId: options.clientId,
            clientSecret: options.clientSecret,
        });
    }

    public async initialize(): Promise<void> {
        const {
            body: { access_token },
        } = await this.client.clientCredentialsGrant();

        this.client.setAccessToken(access_token);
    }

    private async request<TPath extends keyof ApiParameters>(
        path: TPath,
        query?: Parameters<ApiParameters[TPath]>[0],
    ): Promise<JsonResponse<ReturnType<ApiParameters[TPath]>>> {
        let targetPath: string = path;

        // replace path parameters is appeared in path like "{name}" with query parameters
        const pathParams = targetPath.match(/{\w+}/g);
        if (pathParams && query) {
            for (const param of pathParams) {
                const paramName = param.replace(/[{}]/g, "");
                const paramValue = query[paramName];
                if (!paramValue) {
                    throw new Error(`Missing path parameter: ${paramName}`);
                }

                targetPath = targetPath.replace(param, paramValue);
                delete query[paramName];
            }
        }

        let request = Request.create()
            .withScheme("https")
            .withHost("api.spotify.com")
            .withPort(443)
            .withAuth(this.client.getAccessToken())
            .withPath(targetPath);

        if (query) {
            request = request.withQuery(query);
        }

        const { body, headers, statusCode } = await request
            .build()
            .executeJson<ReturnType<ApiParameters[TPath]> | ErrorResponse>();
        if (is<ErrorResponse>(body)) {
            const { error } = body;
            if (error.status === 401) {
                await this.initialize();
                return await this.request(path, query);
            }

            throw new Error(`${error.message} (${error.status})`);
        }

        return {
            body,
            headers,
            statusCode,
        };
    }

    protected async fetchArtistAlbums(
        artistId: string,
        offset?: number,
        limit?: number,
        locale?: string,
    ): Promise<Nullable<RawArtistAlbums>> {
        const albumIds: string[] = [];
        let total = 0;

        try {
            const { body } = await this.request("/v1/artists/{id}/albums", { id: artistId, offset, limit, locale });
            albumIds.push(...body.items.map(item => item.id));

            total = body.total;
        } catch (e) {
            return null;
        }

        const albums = await this.getAlbums(albumIds, locale);
        const validAlbums = albums.filter(isRawAlbum);
        if (validAlbums.length !== albumIds.length) {
            throw new Error("Failed to fetch artist albums");
        }

        return {
            total,
            items: validAlbums,
        };
    }

    protected async getTracks(ids: string[], locale?: string) {
        const { body } = await this.request("/v1/tracks", { ids, locale });

        return body.tracks.map(item => (item ? this.composeTrack(item) : null));
    }
    protected async getAlbums(ids: string[], locale?: string) {
        const { body } = await this.request("/v1/albums", { ids, locale });

        return body.albums.map(item => (item ? this.composeAlbum(item) : null));
    }
    protected async getArtists(ids: string[], locale?: string) {
        const { body } = await this.request("/v1/artists", { ids, locale });

        return body.artists.map(item => (item ? this.composeArtist(item) : null));
    }

    protected async searchTrack({ query, limit = 20, locale }: SearchInput) {
        const { body } = await this.request("/v1/search", { q: query, type: ["track"], limit, locale });
        if (!body.tracks) {
            throw new Error("Invalid response");
        }

        return body.tracks.items.map(this.composeTrack);
    }
    protected async searchAlbum({ query, limit = 20, locale }: SearchInput) {
        const { body } = await this.request("/v1/search", { q: query, type: ["album"], limit, locale });
        if (!body.albums) {
            throw new Error("Invalid response");
        }

        const {
            body: { albums },
        } = await this.request("/v1/albums", {
            ids: body.albums.items.map(album => album.id),
            locale,
        });

        return albums.map(this.composeAlbum);
    }
    protected async searchArtist({ query, limit = 20, locale }: SearchInput) {
        const { body } = await this.request("/v1/search", { q: query, type: ["artist"], limit, locale });
        if (!body.artists) {
            throw new Error("Invalid response");
        }

        return body.artists.items.map(this.composeArtist);
    }

    private composeTrack(track: SpotifyApi.TrackObjectFull): RawTrack {
        return {
            id: track.id,
            title: track.name,
            track: track.track_number,
            disc: track.disc_number,
            duration: track.duration_ms,
            year: track.album.release_date,
            album: {
                id: track.album.id,
                title: track.album.name,
                releaseDate: track.album.release_date,
                trackCount: track.album.total_tracks,
                artists: track.album.artists.map(artist => ({
                    id: artist.id,
                    name: artist.name,
                })),
                albumArts: track.album.images.map(image => ({
                    url: image.url,
                    width: image.width,
                    height: image.height,
                })),
            },
            artists: track.artists.map(artist => ({
                id: artist.id,
                name: artist.name,
            })),
        };
    }
    private composeAlbum(album: SpotifyApi.AlbumObjectFull): RawAlbum {
        const releaseDate = dayjs(album.release_date, "YYYY-MM-DD");
        return {
            id: album.id,
            title: album.name,
            releaseDate: {
                year: releaseDate.year(),
                month: releaseDate.month() + 1,
                day: releaseDate.date(),
                timestamp: releaseDate.unix(),
            },
            trackCount: album.total_tracks,
            artists: album.artists.map(artist => ({
                id: artist.id,
                name: artist.name,
            })),
            albumArts: album.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
            })),
            tracks: album.tracks.items.map(track => ({
                id: track.id,
                title: track.name,
                track: track.track_number,
                disc: track.disc_number,
                duration: track.duration_ms,
                year: album.release_date,
                artists: track.artists.map(artist => ({
                    id: artist.id,
                    name: artist.name,
                })),
            })),
        };
    }
    private composeArtist(artist: SpotifyApi.ArtistObjectFull): RawArtist {
        return {
            id: artist.id,
            name: artist.name,
            artistImages: artist.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
            })),
        };
    }
}
