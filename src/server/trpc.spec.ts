import TRPCServer from "@server/trpc";

describe("TRPC Server", () => {
    let target: TRPCServer;

    beforeEach(() => {
        target = new TRPCServer([]);
    });

    it("should be able to be instantiated", () => {
        expect(target).toBeDefined();
        expect(target["rootRouter"]).toBeDefined();
    });
});
