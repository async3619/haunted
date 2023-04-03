import { Loggable } from "@utils/loggable";

describe("Loggable", () => {
    let loggable: Loggable;

    class MockedClass extends Loggable<"Mocked"> {
        public constructor() {
            super("Mocked");
        }
    }

    beforeEach(() => {
        loggable = new MockedClass();
    });

    it("should be defined", () => {
        expect(loggable).toBeDefined();
    });

    it("should be able to get the name", () => {
        expect(loggable.getName()).toBe("Mocked");
    });
});
