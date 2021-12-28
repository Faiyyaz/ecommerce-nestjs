import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './utilities/http.exception';
import { ValidationException } from './utilities/validation.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Enabling validation
  app.useGlobalPipes(
    new ValidationPipe({
      //Creating error key-value pairs
      exceptionFactory: (errors: ValidationError[]) => {
        const message = {};
        errors.forEach((element) => {
          const constraints = element.constraints;
          let validationError = '';
          if (constraints != undefined && constraints != null) {
            const errors = Object.values(constraints);
            if (errors != undefined && errors.length > 0) {
              validationError = errors[0];
            }
          }
          message[element.property] = validationError;
        });
        return new ValidationException(message);
      },
    }),
  );

  //Custom error filter
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
}
bootstrap();
