import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { InventException } from '@exceptions';
import { ERROR_MESSAGES } from '@constants';
import ValidationException from '../exceptions/validation';

const createErrorResponse = (exception: InventException) => {
  const error = exception?.constructor?.name;
  const { code, message, data, errorData } = exception;

  return {
    code,
    error,
    message,
    data,
    errorData,
  };
};

const createValidationErrorForResponse = (exception: ValidationException) => {
  const { code, error } = ERROR_MESSAGES.VALIDATION;
  const { constraints, property }: any = exception.getResponse();

  const rawConstraints = Object.values(constraints)?.filter((obj) => obj);

  const message: string = rawConstraints.join(', ');
  const details: { messages: any; path: string } = {
    messages: rawConstraints,
    path: property,
  };

  return {
    code,
    error,
    message,
    details,
  };
};

const createUnknownErrorResponse = (exception: HttpException) => {
  const { code } = ERROR_MESSAGES.UNKNOWN;
  const statusCode: any = exception.getStatus?.();
  const response: any = exception.getResponse?.();
  return {
    code: statusCode ?? code,
    error: response?.error ?? exception.name,
    message: response?.message?.toString() ?? exception.message,
  };
};

const getError = (exception: HttpException) => {
  if (exception instanceof InventException) {
    return createErrorResponse(exception);
  }

  if (exception instanceof ValidationException) {
    return createValidationErrorForResponse(exception);
  }

  return createUnknownErrorResponse(exception);
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: any, host: ArgumentsHost) {
    const output = getError(exception);
    const ctx = host.switchToHttp();
    const res = ctx?.getResponse<FastifyReply>();
    const status: HttpStatus =
      exception?.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(status).send(output);
  }
}

@Catch(Error)
export class ErrorFilter implements ExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    res.status(500).send({
      code: 500,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
