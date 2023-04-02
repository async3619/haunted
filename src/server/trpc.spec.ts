import TRPCServer from "@server/trpc";

describe("TRPC Server", () => {
    let target: TRPCServer;

    beforeEach(() => {
        target = new TRPCServer({ port: 3000 }, []);

        // preventing stdout from being polluted
        jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should be able to be instantiated", () => {
        expect(target).toBeDefined();
        expect(target["rootRouter"]).toBeDefined();
    });

    it("should be able to be started and stopped", async () => {
        target = new TRPCServer({ port: 3000 }, []);

        await target.run();
        expect(target.isRunning()).toBe(true);

        await target.stop();
        expect(target.isRunning()).toBe(false);
    });
});