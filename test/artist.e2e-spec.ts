import * as pactum from "pactum";

import { Test, TestingModule } from "@nestjs/testing";

import { AppModule } from "@root/app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { TRPCServerService } from "@trpc-server/trpc-server.service";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { Router } from "@root/index";

describe("Artist (e2e)", () => {
    let app: NestExpressApplication;
    let trpcService: TRPCServerService;
    let url: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        trpcService = app.get(TRPCServerService);
        trpcService.applyMiddleware(app);

        await app.listen(0);
        url = await app.getUrl();
        pactum.request.setBaseUrl(url.replace("[::1]", "localhost"));
    });

    afterEach(async () => {
        await app.close();
    });

    describe("searchArtists (TRPC)", () => {
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

        it("should be able to search artists", async () => {
            const result = await client.searchArtists.query({
                query: "최엘비",
                limit: 1,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: "CHOILB",
                    }),
                ]),
            );
        });

        it("should respect limit", async () => {
            const result = await client.searchArtists.query({
                query: "Test",
                limit: 5,
            });

            expect(result).toHaveLength(5);
        });

        it("should respect locale", async () => {
            const result = await client.searchArtists.query({
                query: "최엘비",
                limit: 1,
            });

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: "CHOILB",
                    }),
                ]),
            );

            const result2 = await client.searchArtists.query({
                query: "최엘비",
                locale: "ko_KR",
                limit: 1,
            });

            expect(result2).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: "최엘비",
                    }),
                ]),
            );
        });
    });

    describe("searchArtists (GraphQL)", () => {
        it("should be able to search artists", async () => {
            return pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchArtists(input: $input) {
                            name
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "이현준",
                        limit: 1,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchArtists).toContainEqual({
                        name: "LeeHyunJun",
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
                        searchArtists(input: $input) {
                            name
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "Test",
                        limit: 5,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchArtists).toHaveLength(5);
                });
        });

        it("should respect locale", async () => {
            await pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchArtists(input: $input) {
                            name
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "최엘비",
                        limit: 1,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchArtists).toContainEqual({
                        name: "CHOILB",
                    });
                });

            await pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        searchArtists(input: $input) {
                            name
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "최엘비",
                        limit: 1,
                        locale: "ko_KR",
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchArtists).toContainEqual({
                        name: "최엘비",
                    });
                });
        });
    });
});
