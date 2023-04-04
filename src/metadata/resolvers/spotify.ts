import SpotifyWebApi from "spotify-web-api-node";

import { SearchInput } from "@common/search-input.dto";
import { Track } from "@common/track.dto";
import { Album } from "@common/album.dto";
import { Artist } from "@common/artist.dto";

import BaseResolver from "@metadata/resolvers/base";

export interface SpotifyResolverOptions {
    clientId: string;
    clientSecret: string;
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

    public async searchTrack({ query, limit = 20, locale }: SearchInput): Promise<Track[]> {
        const { body } = await this.client.search(query, ["track"], {
            limit,
            ...(locale ? { locale } : {}),
        });

        if (!body.tracks) {
            throw new Error("Invalid response from Spotify");
        }

        return body.tracks.items.map(this.convertTrack);
    }
    public async searchAlbum({ query, limit = 20, locale }: SearchInput): Promise<Album[]> {
        const { body } = await this.client.search(query, ["album"], {
            limit,
            ...(locale ? { locale } : {}),
        });

        if (!body.albums) {
            throw new Error("Invalid response from Spotify");
        }

        const {
            body: { albums },
        } = await this.client.getAlbums(
            body.albums.items.map(album => album.id),
            (locale ? { locale } : {}) as any,
        );

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
        const { body } = await this.client.search(query, ["artist"], {
            limit,
            ...(locale ? { locale } : {}),
        });

        if (!body.artists) {
            throw new Error("Invalid response from Spotify");
        }

        return body.artists.items.map(item => this.convertArtist(item));
    }

    private convertTrack(track: SpotifyApi.TrackObjectFull): Track {
        return {
            title: track.name,
            artists: track.artists.map(artist => artist.name),
            track: track.track_number,
            disc: track.disc_number,
            duration: track.duration_ms,
            album: track.album.name,
            year: track.album.release_date,
            albumArtists: track.album.artists.map(artist => artist.name),
        };
    }
    private convertArtist(artist: SpotifyApi.ArtistObjectFull): Artist {
        return {
            name: artist.name,
            artistImages: artist.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
            })),
        };
    }
}
