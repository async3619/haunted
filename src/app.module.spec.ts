import { Test, TestingModule } from "@nestjs/testing";

import { AppModule } from "@root/app.module";

describe("AppModule", () => {
    it("should be able to import", async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        expect(module).toBeDefined();
    });
});
