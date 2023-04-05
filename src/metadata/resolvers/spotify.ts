import { is } from "typia";
import SpotifyWebApi from "spotify-web-api-node";

import { SearchInput } from "@common/search-input.dto";
import { Track } from "@common/track.dto";
import { Album } from "@common/album.dto";
import { Artist } from "@common/artist.dto";

import BaseResolver from "@metadata/resolvers/base";
import { JsonResponse, Request } from "@utils/request";

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
        let request = Request.create()
            .withScheme("https")
            .withHost("api.spotify.com")
            .withPort(443)
            .withAuth(this.client.getAccessToken())
            .withPath(path);

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

    public async searchTrack({ query, limit = 20, locale }: SearchInput): Promise<Track[]> {
        const { body } = await this.request("/v1/search", { q: query, type: ["track"], limit, locale });
        if (!body.tracks) {
            throw new Error("Invalid response");
        }

        return body.tracks.items.map(item => ({
            title: item.name,
            artists: item.artists.map(artist => artist.name),
            track: item.track_number,
            disc: item.disc_number,
            duration: item.duration_ms,
            album: item.album.name,
            year: item.album.release_date,
            albumArtists: item.album.artists.map(artist => artist.name),
        }));
    }
    public async searchAlbum({ query, limit = 20, locale }: SearchInput): Promise<Album[]> {
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

        return albums.map((item, index) => ({
            uri: super.getId(item.id),
            resolverName: this.getName(),
            locale: locale || "default",
            query,
            index,
            title: item.name,
            artists: item.artists.map(artist => artist.name),
            albumArts: item.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
            })),
            releaseDate: item.release_date,
            trackCount: item.total_tracks,
            tracks: item.tracks.items.map(track => ({
                title: track.name,
                artists: track.artists.map(artist => artist.name),
                track: track.track_number,
                disc: track.disc_number,
                duration: track.duration_ms,
                album: item.name,
                year: item.release_date,
                albumArtists: item.artists.map(artist => artist.name),
            })),
        }));
    }
    public async searchArtist({ query, limit = 20, locale }: SearchInput): Promise<Artist[]> {
        const { body } = await this.request("/v1/search", { q: query, type: ["artist"], limit, locale });
        if (!body.artists) {
            throw new Error("Invalid response");
        }

        return body.artists.items.map(item => ({
            name: item.name,
            artistImages: item.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
            })),
        }));
    }
}
