import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { GlobalExceptionHandler } from "./shared/handlers/global-exception.handler";

async function initializeServer() {
  const application = await NestFactory.create(AppModule);

  application.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  application.useGlobalFilters(new GlobalExceptionHandler());
  application.enableCors();

  const serverPort = process.env.PORT || 5000;
  await application.listen(serverPort, "0.0.0.0");
  console.log(`Server initialized on port ${serverPort}`);
}

initializeServer();
