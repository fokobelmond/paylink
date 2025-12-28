import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS - Configuration permissive pour production
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://paylink-one.vercel.app',
    'https://paylink.vercel.app',
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origin (ex: mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }
      // Permettre toutes les origines Vercel
      if (origin.includes('vercel.app') || origin.includes('localhost') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, true); // En production, on accepte tout pour l'instant
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PayLink API')
      .setDescription('API de la plateforme de paiement Mobile Money PayLink')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentification')
      .addTag('pages', 'Gestion des pages')
      .addTag('services', 'Gestion des services')
      .addTag('payments', 'Paiements Mobile Money')
      .addTag('transactions', 'Historique des transactions')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 PayLink API running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
}

bootstrap();


