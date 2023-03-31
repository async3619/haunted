import SpotifyWebApi from "spotify-web-api-node";
import dayjs from "dayjs";

import BaseResolver from "@resolver/base";

import { SearchResult } from "@utils/types";

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

    public async search(query: string, limit = 50): Promise<SearchResult> {
        const { body } = await this.client.search(query, ["artist", "album", "track"], {
            limit,
        });

        if (!body.tracks) {
            throw new Error("Failed to get track information");
        }

        const musics = body.tracks.items.map(item => {
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

        return { musics };
    }
}
