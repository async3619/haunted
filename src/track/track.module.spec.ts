import { Test, TestingModule } from "@nestjs/testing";

import { TrackModule } from "@track/track.module";

describe("TrackModule", () => {
    it("should be able to import", async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TrackModule],
        }).compile();

        expect(module).toBeDefined();
    });
});
