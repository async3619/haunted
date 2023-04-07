import { Test, TestingModule } from "@nestjs/testing";
import { NestExpressApplication } from "@nestjs/platform-express";

import { TRPCServerService } from "@trpc-server/trpc-server.service";

import { AppModule } from "@root/app.module";

export async function initializeE2E() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app: NestExpressApplication = moduleFixture.createNestApplication();
    const trpcService = app.get(TRPCServerService);
    trpcService.applyMiddleware(app);

    await app.listen(0);
    const url = await app.getUrl();

    return { app, url };
}
