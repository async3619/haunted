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

export interface Image {
    url: string;
    width?: number;
    height?: number;
}

export interface Album {
    title: string;
    artists: string[];
    releaseDate: string;
    trackCount: number;
    albumArts: Image[];
}

export interface Artist {
    name: string;
    artistImage: Image[];
}

export interface SearchInput {
    query: string;
    limit?: number;
}

export type SearchMusicsOutput = Music[];
export type SearchAlbumsOutput = Album[];
export type SearchArtistsOutput = Artist[];

export interface SearchOutput {
    musics: SearchMusicsOutput;
    albums: SearchAlbumsOutput;
    artists: SearchArtistsOutput;
}

export type Fn<TArgs = void, TReturn = void> = TArgs extends void
    ? () => TReturn
    : TArgs extends any[]
    ? (...args: TArgs) => TReturn
    : (args: TArgs) => TReturn;
export type AsyncFn<TArgs = void, TReturn = void> = Fn<TArgs, Promise<TReturn>>;
