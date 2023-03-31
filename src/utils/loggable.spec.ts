import { Loggable } from "@utils/loggable";

describe("Loggable", () => {
    it("should be able to be instantiated", () => {
        class Test extends Loggable {
            public constructor() {
                super("Test");
            }
        }

        const test = new Test();

        expect(test).toBeInstanceOf(Test);
    });

    it("should be able to get name", () => {
        class Test extends Loggable {
            public constructor() {
                super("Test");
            }
        }

        const test = new Test();

        expect(test.getName()).toBe("Test");
    });
});
