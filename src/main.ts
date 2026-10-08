import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import {
  UPLOAD_ROOT,
  PET_PHOTO_DIR,
  LOST_PET_PHOTO_DIR,
  UPLOAD_PUBLIC_PREFIX,
} from './upload/upload.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Prefixos e CORS
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Segurança
  app.use(
    helmet({
      // As fotos são servidas em outra porta/origem que o front. Com a
      // política padrão (same-origin) o navegador bloqueia a exibição.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cookieParser());

  // Validação Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  mkdirSync(PET_PHOTO_DIR, { recursive: true });
  mkdirSync(LOST_PET_PHOTO_DIR, { recursive: true });
  app.useStaticAssets(UPLOAD_ROOT, {
    prefix: `${UPLOAD_PUBLIC_PREFIX}/`,
  });

  // Documentação
  const config = new DocumentBuilder()
    .setTitle('API Lar de Patas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicação rodando em: http://localhost:${port}/api`);
  console.log(`Documentação rodando em: http://localhost:${port}/docs`);
  console.log(`Uploads servidos em: http://localhost:${port}${UPLOAD_PUBLIC_PREFIX}/`);
}
bootstrap();