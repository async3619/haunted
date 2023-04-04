import _ from "lodash";

import { SearchInput } from "@common/search-input.dto";
import { Track } from "@common/track.dto";
import { Album } from "@common/album.dto";
import { Artist } from "@common/artist.dto";

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

    public abstract initialize(): Promise<void>;

    public abstract searchTrack(input: SearchInput): Promise<Track[]>;
    public abstract searchAlbum(input: SearchInput): Promise<Album[]>;
    public abstract searchArtist(input: SearchInput): Promise<Artist[]>;
}
