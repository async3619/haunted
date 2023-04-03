import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "@root/app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}

bootstrap();
