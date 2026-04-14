import * as pkg from '../../package.json';

const name: string = process.env.NAME || pkg.name;
const version: string = process.env.VERSION || pkg.version;
const env: string = process.env.NODE_ENV || 'dev';

export default () => ({
  name,
  version,
  env,
  language: 'en',
  postgres: {
    name: process.env.DATABASE_NAME,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
  },
  server: {
    port: parseInt(<string>process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    bodyLimit: parseInt(<string>process.env.BODY_LIMIT, 10) || 10240,
    logLevel: process.env.LOG_LEVEL || 'info',
    keepAliveTimeout:
      parseInt(<string>process.env.SERVER_KEEP_ALIVE_TIMEOUT, 10) || 120000,
  },
  swagger: {
    enabled:
      (process.env.SWAGGER_ENABLED || 'true').trim().toLowerCase() === 'true',
  },
  log: {
    name,
    version,
    env,
    level: process.env.LOG_LEVEL || 'info',
  },
});
