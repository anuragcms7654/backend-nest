import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes extra fields
      forbidNonWhitelisted: true, // throws error if extra fields sent
      transform: true, // auto-transform payload to DTO types
      // exceptionFactory: (errors) => {
      //   const firstError = errors[0]; // take first field error
      //   const firstConstraint = Object.values(firstError.constraints || {})[0];
      //   return new BadRequestException({
      //     message: firstConstraint || 'Invalid input',
      //   });
      // },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
