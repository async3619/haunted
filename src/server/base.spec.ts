import { ResolverPair } from "@resolver";
import BaseServer from "@server/base";

describe("Base Server", () => {
    let target: BaseServer<string, Record<string, any>>;

    beforeEach(() => {
        // preventing stdout from being polluted
        jest.spyOn(process.stdout, "write").mockImplementation(() => true);

        class MockServer extends BaseServer<string, Record<string, any>> {
            public constructor(name: string, options: Record<string, any>, resolvers: ReadonlyArray<ResolverPair>) {
                super(name, options, resolvers);
            }

            public isRunning = jest.fn().mockReturnValue(false);
            public start = jest.fn().mockResolvedValue(undefined);
            public stop = jest.fn().mockResolvedValue(undefined);
        }

        target = new MockServer("mock", {}, []);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should be able to be instantiated", () => {
        expect(target).toBeDefined();
    });

    it("should be able to get options", () => {
        const options = target.getOptions();

        expect(options).toBeDefined();
    });
});
