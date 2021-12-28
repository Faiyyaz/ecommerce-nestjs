import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationException } from './validation.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const message = exception.message;
    const errorResponse = exception.getResponse();
    let data = {};
    if (exception instanceof ValidationException) {
      data = errorResponse;
    }

    response.status(status).send({
      statusCode: status,
      message: message,
      data: data,
    });
  }
}
