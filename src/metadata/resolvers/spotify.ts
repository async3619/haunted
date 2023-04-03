import SpotifyWebApi from "spotify-web-api-node";

import { SearchInput } from "@common/search-input.dto";
import { SearchResult } from "@common/search-result.dto";
import { Track } from "@common/track.dto";
import { Artist } from "@common/artist.dto";
import { Album } from "@common/album.dto";

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

    public async search({ query, limit = 50 }: SearchInput): Promise<SearchResult> {
        const { body } = await this.client.search(query, ["track", "album", "artist"], {
            limit,
        });

        if (!body.artists || !body.albums || !body.tracks) {
            throw new Error("Invalid response from Spotify");
        }

        return {
            tracks: body.tracks.items.map(this.convertTrack),
            albums: body.albums.items.map(this.convertAlbum),
            artists: body.artists.items.map(this.convertArtist),
        };
    }
    public async searchTrack({ query, limit = 50 }: SearchInput): Promise<Track[]> {
        const { body } = await this.client.search(query, ["track"], {
            limit,
        });

        if (!body.tracks) {
            throw new Error("Invalid response from Spotify");
        }

        return body.tracks.items.map(this.convertTrack);
    }
    public async searchAlbum({ query, limit = 50 }: SearchInput): Promise<Album[]> {
        const { body } = await this.client.search(query, ["album"], {
            limit,
        });

        if (!body.albums) {
            throw new Error("Invalid response from Spotify");
        }

        return body.albums.items.map(this.convertAlbum);
    }
    public async searchArtist({ query, limit = 50 }: SearchInput): Promise<Artist[]> {
        const { body } = await this.client.search(query, ["artist"], {
            limit,
        });

        if (!body.artists) {
            throw new Error("Invalid response from Spotify");
        }

        return body.artists.items.map(this.convertArtist);
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
    private convertAlbum(album: SpotifyApi.AlbumObjectSimplified): Album {
        return {
            title: album.name,
            artists: album.artists.map(artist => artist.name),
            albumArts: album.images.map(image => ({
                url: image.url,
                width: image.width,
                height: image.height,
            })),
            releaseDate: album.release_date,
            trackCount: album.total_tracks,
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
