import * as Joi from 'joi';
import { Environment } from '../common/enums';
import { DEFAULT_ENV_VALUES } from '../common/constants';

export const envVariableSchema: Joi.ObjectSchema = Joi.object({
  ENV: Joi.string()
    .valid(...Object.values(Environment))
    .default(Environment.DEVELOPMENT),

  NAME: Joi.string().default(DEFAULT_ENV_VALUES),
  PORT: Joi.number().default(DEFAULT_ENV_VALUES.DEFAULT.PORT),
  HOST: Joi.string().default(DEFAULT_ENV_VALUES.DEFAULT.HOST),
  LOG_LEVEL: Joi.string().default(DEFAULT_ENV_VALUES.DEFAULT.LOG_LEVEL),
  BODY_LIMIT: Joi.string().default(DEFAULT_ENV_VALUES.DEFAULT.BODY_LIMIT),
  SERVER_KEEP_ALIVE_TIMEOUT: Joi.number().default(
    DEFAULT_ENV_VALUES.DEFAULT.SERVER_KEEP_ALIVE_TIMEOUT,
  ),

  // Postgres
  DATABASE_NAME: Joi.string().default(DEFAULT_ENV_VALUES.DEFAULT.DATABASE_NAME),
  POSTGRES_PORT: Joi.number().default(DEFAULT_ENV_VALUES.DEFAULT.POSTGRES_PORT),
  POSTGRES_USERNAME: Joi.string().default(
    DEFAULT_ENV_VALUES.DEFAULT.POSTGRES_USERNAME,
  ),
  POSTGRES_PASSWORD: Joi.string().default(
    DEFAULT_ENV_VALUES.DEFAULT.POSTGRES_PASSWORD,
  ),
  POSTGRES_HOST: Joi.string().default(DEFAULT_ENV_VALUES.DEFAULT.POSTGRES_HOST),

  // Swagger
  SWAGGER_ENABLED: Joi.string().default(
    DEFAULT_ENV_VALUES.DEFAULT.SWAGGER_ENABLED,
  ),
});
