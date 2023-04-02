import "reflect-metadata";

import GraphQLServer from "@server/graphql";

describe("GraphQL Server", () => {
    let target: GraphQLServer;

    beforeEach(() => {
        target = new GraphQLServer({ port: 3000 }, []);

        // preventing stdout from being polluted
        jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should be able to be instantiated", () => {
        expect(target).toBeDefined();
    });

    it("should be able to be started and stopped", async () => {
        target = new GraphQLServer({ port: 3001 }, []);

        await target.run();

        expect(target.isRunning()).toBe(true);

        await target.stop();

        expect(target.isRunning()).toBe(false);
    });
});
