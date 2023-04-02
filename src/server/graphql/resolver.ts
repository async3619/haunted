import { Arg, Ctx, Query, Resolver } from "type-graphql";

import { GraphQLContext } from "@server/graphql";

import iterate from "@utils/iterate";
import { Album, Artist, Music, SearchInput, SearchOutput } from "@utils/types";

@Resolver()
export default class GraphQLResolver {
    @Query(() => [Music])
    private async searchMusics(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<Music[]> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchMusics(input.query, input.limit),
        );

        return result.flatMap(musics => musics);
    }

    @Query(() => [Album])
    private async searchAlbums(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<Album[]> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchAlbums(input.query, input.limit),
        );

        return result.flatMap(albums => albums);
    }

    @Query(() => [Artist])
    private async searchArtists(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<Artist[]> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.searchArtists(input.query, input.limit),
        );

        return result.flatMap(artists => artists);
    }

    @Query(() => SearchOutput)
    private async search(@Arg("input") input: SearchInput, @Ctx() context: GraphQLContext): Promise<SearchOutput> {
        const result = await iterate(
            context.resolvers.map(([, resolver]) => resolver),
            resolver => resolver.search(input.query, input.limit),
        );

        return {
            musics: result.flatMap(item => item.musics),
            albums: result.flatMap(item => item.albums),
            artists: result.flatMap(item => item.artists),
        };
    }
}
