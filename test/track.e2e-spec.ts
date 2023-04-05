import * as pactum from "pactum";

import { Test, TestingModule } from "@nestjs/testing";
import { NestExpressApplication } from "@nestjs/platform-express";

import { TRPCServerService } from "@trpc-server/trpc-server.service";

import { AppModule } from "@root/app.module";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { Router } from "@root/index";

describe("Track (e2e)", () => {
    let app: NestExpressApplication;
    let trpcService: TRPCServerService;
    let url: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestExpressApplication>();

        trpcService = app.get(TRPCServerService);
        trpcService.applyMiddleware(app);

        await app.listen(0);
        url = await app.getUrl();
        pactum.request.setBaseUrl(url.replace("[::1]", "localhost"));
    });

    afterEach(async () => {
        await app.close();
    });

    describe("searchTracks (TRPC)", () => {
        let client: ReturnType<typeof createTRPCProxyClient<Router>>;

        beforeEach(() => {
            client = createTRPCProxyClient<Router>({
                links: [
                    httpBatchLink({
                        url: `${url}/trpc`,
                    }),
                ],
            });
        });

        it("should be able to search tracks", async () => {
            const result = await client.searchTracks.query({
                query: "번역 중 손실",
                limit: 1,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        album: "번역 중 손실 LOST IN TRANSLATION",
                        artists: ["LeeHyunJun"],
                    }),
                ]),
            );
        });

        it("should respect limit", async () => {
            const result = await client.searchTracks.query({
                query: "독립음악",
                limit: 5,
            });

            expect(result).toHaveLength(5);
        });

        it("should respect locale", async () => {
            const result = await client.searchTracks.query({
                query: "독립음악",
                limit: 1,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "Independent Music",
                        artists: ["CHOILB"],
                    }),
                ]),
            );

            const result2 = await client.searchTracks.query({
                query: "독립음악",
                locale: "ko_KR",
                limit: 1,
            });

            expect(result2).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        title: "독립음악",
                        artists: ["최엘비"],
                    }),
                ]),
            );
        });
    });

    describe("searchTracks (GraphQL)", () => {
        it("should be able to search tracks", async () => {
            return pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchTracks(input: $input) {
                          title
                          artists
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "번역 중 손실",
                        limit: 5,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchTracks).toContainEqual({
                        title: "번역 중 손실 Lost In Translation",
                        artists: ["LeeHyunJun"],
                    });
                });
        });

        it("should respect limit", async () => {
            return pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchTracks(input: $input) {
                          title
                          artists
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "Test",
                        limit: 10,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchTracks).toHaveLength(10);
                });
        });

        it("should respect locale", async () => {
            await pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchTracks(input: $input) {
                          title
                          artists
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "독립음악",
                        locale: "ko_KR",
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchTracks).toContainEqual({
                        title: "독립음악",
                        artists: ["최엘비"],
                    });
                });

            await pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchTracks(input: $input) {
                          title
                          artists
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "독립음악",
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchTracks).toContainEqual({
                        title: "Independent Music",
                        artists: ["CHOILB"],
                    });
                });
        });
    });
});
