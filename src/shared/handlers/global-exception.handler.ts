import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionHandler implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'An unexpected error occurred';
    let errorType = 'ServerError';

    if (error instanceof HttpException) {
      statusCode = error.getStatus();
      const errorResponse = error.getResponse();
      
      if (typeof errorResponse === 'string') {
        errorMessage = errorResponse;
        errorType = error.name;
      } else if (typeof errorResponse === 'object') {
        const errorObj = errorResponse as Record<string, any>;
        errorMessage = errorObj.message || error.message;
        errorType = errorObj.error || error.name;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorType = error.name;
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      errorType,
      errorMessage,
      requestPath: request.url,
      httpMethod: request.method,
      occurredAt: new Date().toISOString(),
    });
  }
}
