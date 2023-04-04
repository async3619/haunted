import * as pactum from "pactum";

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { AppModule } from "@root/app.module";

describe("Meatadata (e2e)", () => {
    let app: INestApplication;
    let url: string;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.listen(0);
        url = await app.getUrl();
        pactum.request.setBaseUrl(url.replace("[::1]", "localhost"));
    });

    afterEach(async () => {
        await app.close();
    });

    describe("search", () => {
        it("should be able to search whole media items", async () => {
            return pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        search(input: $input) {
                            tracks {
                              title
                              artists
                            }
                            albums {
                              title
                              artists
                            }
                            artists {
                              name
                            }
                        }
                    }
                `,
                )
                .withGraphQLVariables({
                    input: {
                        query: "번역 중 손실",
                        limit: 1,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.search.tracks).toHaveLength(1);
                    expect(body.data.search.albums).toHaveLength(1);
                    expect(body.data.search.artists).toHaveLength(1);
                });
        });

        it("should respect the limit of search results", async () => {
            return pactum
                .spec()
                .post("/graphql")
                .withGraphQLQuery(
                    `
                    query ($input: SearchInput!) {
                        search(input: $input) {
                            tracks {
                              title
                              artists
                            }
                            albums {
                              title
                              artists
                            }
                            artists {
                              name
                            }
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
                    expect(body.data.search.tracks).toHaveLength(5);
                    expect(body.data.search.albums).toHaveLength(5);
                    expect(body.data.search.artists).toHaveLength(5);
                });
        });
    });
});
