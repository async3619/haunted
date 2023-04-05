import "reflect-metadata";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";

import { TRPCServerService } from "@trpc-server/trpc-server.service";

import { AppModule } from "@root/app.module";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const trpcService = app.get(TRPCServerService);
    app.useGlobalPipes(new ValidationPipe());
    trpcService.applyMiddleware(app);

    await app.listen(3000);
}

bootstrap();
