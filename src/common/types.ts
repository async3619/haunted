import { Track } from "@common/track.dto";
import { Album } from "@common/album.dto";
import { Artist } from "@common/artist.dto";

export type MediaObject = Track | Album | Artist;
export type MediaType = "track" | "album" | "artist";

export type MediaTypeFromObject<T extends MediaObject> = T extends Track
    ? "track"
    : T extends Album
    ? "album"
    : "artist";

export type MediaObjectMap = {
    track: Track;
    album: Album;
    artist: Artist;
};

export type ToRawType<T> = T extends Array<infer TItem>
    ? ToRawType<TItem>[]
    : T extends object
    ? { [TKey in Exclude<keyof T, "serviceName">]: ToRawType<T[TKey]> }
    : T;
