import SpotifyWebApi from "spotify-web-api-node";
import dayjs from "dayjs";

import BaseResolver from "@resolver/base";

import { SearchAlbumsOutput, SearchOutput, SearchArtistsOutput, SearchMusicsOutput } from "@utils/types";

export interface SpotifyResolverOptions {
    clientId: string;
    clientSecret: string;
}

export default class SpotifyResolver extends BaseResolver<"Spotify", SpotifyResolverOptions> {
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

    public async search(query: string, limit = 50): Promise<SearchOutput> {
        const { body } = await this.client.search(query, ["artist", "album", "track"], { limit });
        if (!body.artists || !body.albums || !body.tracks) {
            throw new Error("Failed to get information");
        }

        return {
            musics: body.tracks.items.map(item => {
                return {
                    title: item.name,
                    artists: item.artists.map(artist => artist.name),
                    album: item.album.name,
                    albumArtists: item.album.artists.map(artist => artist.name),
                    duration: item.duration_ms,
                    track: item.track_number,
                    disc: item.disc_number,
                    year: dayjs(item.album.release_date).year(),
                };
            }),
            albums: body.albums.items.map(item => ({
                title: item.name,
                artists: item.artists.map(artist => artist.name),
                albumArts: item.images.map(item => ({
                    url: item.url,
                    width: item.width,
                    height: item.height,
                })),
                releaseDate: item.release_date,
                trackCount: item.total_tracks,
            })),
            artists: body.artists.items.map(item => ({
                name: item.name,
                artistImage: item.images.map(item => ({
                    url: item.url,
                    width: item.width,
                    height: item.height,
                })),
            })),
        };
    }
    public async searchMusics(query: string, limit = 50): Promise<SearchMusicsOutput> {
        const { body } = await this.client.search(query, ["track"], { limit });
        if (!body.tracks) {
            throw new Error("Failed to get track information");
        }

        return body.tracks.items.map(item => {
            return {
                title: item.name,
                artists: item.artists.map(artist => artist.name),
                album: item.album.name,
                albumArtists: item.album.artists.map(artist => artist.name),
                duration: item.duration_ms,
                track: item.track_number,
                disc: item.disc_number,
                year: dayjs(item.album.release_date).year(),
            };
        });
    }
    public async searchAlbums(query: string, limit = 50): Promise<SearchAlbumsOutput> {
        const { body } = await this.client.search(query, ["album"], { limit });
        if (!body.albums) {
            throw new Error("Failed to get album information");
        }

        return body.albums.items.map(item => ({
            title: item.name,
            artists: item.artists.map(artist => artist.name),
            albumArts: item.images.map(item => ({
                url: item.url,
                width: item.width,
                height: item.height,
            })),
            releaseDate: item.release_date,
            trackCount: item.total_tracks,
        }));
    }
    public async searchArtists(query: string, limit = 50): Promise<SearchArtistsOutput> {
        const { body } = await this.client.search(query, ["artist"], { limit });
        if (!body.artists) {
            throw new Error("Failed to get artist information");
        }

        return body.artists.items.map(item => ({
            name: item.name,
            artistImage: item.images.map(item => ({
                url: item.url,
                width: item.width,
                height: item.height,
            })),
        }));
    }
}
