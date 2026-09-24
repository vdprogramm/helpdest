import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';

import 'dotenv/config';

import { join } from 'path';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  // Cho phép React Vite gọi Backend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(
    join(process.cwd(), 'uploads'),
    {
      prefix: '/uploads/',
    },
  );

  const port =
    process.env.PORT ?? 3005;

  await app.listen(port);

  console.log(
    `Helpdesk Backend running at http://localhost:${port}`,
  );
}

bootstrap();