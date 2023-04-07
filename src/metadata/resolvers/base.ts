import _ from "lodash";

import { SearchInput } from "@common/search-input.dto";
import { isRawTrackArray, RawTrack } from "@common/track.dto";
import { RawArtist } from "@common/artist.dto";
import { isRawAlbumArray, RawAlbum } from "@common/album.dto";
import { MediaObjectMap, MediaType } from "@common/types";

import { Loggable } from "@utils/loggable";
import { Nullable } from "@utils/types";

export default abstract class BaseResolver<
    TType extends string,
    TOptions extends Record<string, any>,
> extends Loggable<TType> {
    private readonly options: TOptions;

    protected constructor(name: TType, options: TOptions) {
        super(name);

        this.options = options;
    }

    public getOptions() {
        return _.cloneDeep(this.options);
    }
    public getServiceName() {
        return this.getName().toLowerCase();
    }

    public getId(id: string) {
        return `${this.getServiceName()}::${id}`;
    }
    public getRawId(id: string) {
        if (!id.startsWith(`${this.getServiceName()}::`)) {
            return null;
        }

        return id.replace(`${this.getServiceName()}::`, "");
    }

    public abstract initialize(): Promise<void>;

    public async search<Type extends MediaType>(input: SearchInput, type: Type): Promise<MediaObjectMap[Type][]> {
        const rawData = await (async () => {
            switch (type) {
                case "track":
                    return await this.searchTrack(input);

                case "album":
                    return await this.searchAlbum(input);

                case "artist":
                    return await this.searchArtist(input);

                default:
                    throw new Error(`Unknown type: ${type}`);
            }
        })();

        let result = rawData.map(item => ({
            ...item,
            id: this.getId(item.id),
            serviceName: this.getServiceName(),
        }));

        if (isRawAlbumArray(result)) {
            result = result.map(album => ({
                ...album,
                artists: album.artists.map(artist => ({
                    ...artist,
                    id: this.getId(artist.id),
                })),
                tracks: album.tracks.map(track => ({
                    ...track,
                    id: this.getId(track.id),
                })),
            }));
        } else if (isRawTrackArray(result)) {
            result = result.map(track => ({
                ...track,
                artists: track.artists.map(artist => ({
                    ...artist,
                    id: this.getId(artist.id),
                })),
                album: {
                    ...track.album,
                    id: this.getId(track.album.id),
                },
            }));
        }

        return result;
    }

    public async getItem<Type extends MediaType>(
        id: string,
        type: Type,
        locale?: string,
    ): Promise<Nullable<MediaObjectMap[Type]>> {
        const items = await this.getItems([id], type, locale);

        return items[0];
    }
    public async getItems<Type extends MediaType>(
        ids: string[],
        type: Type,
        locale?: string,
    ): Promise<Nullable<MediaObjectMap[Type]>[]> {
        const rawData = await (async () => {
            switch (type) {
                case "track":
                    return await this.getTracks(ids, locale);

                case "album":
                    return await this.getAlbums(ids, locale);

                case "artist":
                    return await this.getArtists(ids, locale);

                default:
                    throw new Error(`Unknown type: ${type}`);
            }
        })();

        return rawData.map(item =>
            item
                ? {
                      ...item,
                      id: this.getId(item.id),
                      serviceName: this.getServiceName(),
                  }
                : null,
        );
    }

    protected abstract getTracks(ids: string[], locale?: string): Promise<Nullable<RawTrack>[]>;
    protected abstract getAlbums(ids: string[], locale?: string): Promise<Nullable<RawAlbum>[]>;
    protected abstract getArtists(ids: string[], locale?: string): Promise<Nullable<RawArtist>[]>;

    protected abstract searchTrack(input: SearchInput): Promise<RawTrack[]>;
    protected abstract searchAlbum(input: SearchInput): Promise<RawAlbum[]>;
    protected abstract searchArtist(input: SearchInput): Promise<RawArtist[]>;
}
