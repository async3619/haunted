import _ from "lodash";

import { SearchInput } from "@common/search-input.dto";
import { RawTrack } from "@common/track.dto";
import { RawArtist } from "@common/artist.dto";
import { RawAlbum } from "@common/album.dto";
import { MediaObjectMap, MediaType } from "@common/types";

import { Loggable } from "@utils/loggable";

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
    public getId(id: string) {
        return `${this.getServiceName()}::${id}`;
    }
    public getServiceName() {
        return this.getName().toLowerCase();
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

        return rawData.map(item => ({
            ...item,
            id: this.getId(item.id),
            serviceName: this.getServiceName(),
        }));
    }

    protected abstract searchTrack(input: SearchInput): Promise<RawTrack[]>;
    protected abstract searchAlbum(input: SearchInput): Promise<RawAlbum[]>;
    protected abstract searchArtist(input: SearchInput): Promise<RawArtist[]>;
}
