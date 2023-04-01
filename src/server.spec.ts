import Server from "@root/server";

describe("Server", () => {
    let target: Server;

    beforeEach(() => {
        target = new Server([]);
    });

    it("should be able to be instantiated", () => {
        expect(target).toBeDefined();
        expect(target["rootRouter"]).toBeDefined();
    });
});
