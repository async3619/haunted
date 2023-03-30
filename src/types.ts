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
