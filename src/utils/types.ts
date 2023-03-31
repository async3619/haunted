export interface Music {
    title: string;
    artists: string[];
    album: string;
    albumArtists: string[];
    duration: number;
    track: number;
    disc: number;
    year: number;
}

export interface SearchResult {
    musics: Music[];
}

export type Fn<TArgs = void, TReturn = void> = TArgs extends void
    ? () => TReturn
    : TArgs extends any[]
    ? (...args: TArgs) => TReturn
    : (args: TArgs) => TReturn;
export type AsyncFn<TArgs = void, TReturn = void> = Fn<TArgs, Promise<TReturn>>;
