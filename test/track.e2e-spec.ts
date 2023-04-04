import * as pactum from "pactum";

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

import { AppModule } from "@root/app.module";

describe("Track (e2e)", () => {
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

    describe("searchTracks", () => {
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
                        limit: 1,
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
                        limit: 5,
                    },
                })
                .expectStatus(200)
                .expect(({ res: { body } }) => {
                    expect(body.data.searchTracks).toHaveLength(5);
                });
        });
    });
});