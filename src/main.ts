import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixos e CORS
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true, // Em produção, especifique o domínio
    credentials: true, // Permite envio de cookies
  });

  // Confia em cabeçalhos de proxy (X-Forwarded-Proto) para saber se a
  // conexão é HTTPS. Sem isso, `request.protocol` fica sempre 'http'.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Segurança
  app.use(helmet());
  app.use(cookieParser()); // Habilita parsing de cookies

  // Validação Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Documentação
  const config = new DocumentBuilder()
    .setTitle('API Lar de Patas')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicação rodando em: http://localhost:${port}/api`);
  console.log(`Documentação rodando em: http://localhost:${port}/docs`);
}
bootstrap();