import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config';
import { envVariableSchema } from './config/env-variable.schema';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ApiModule } from './modules/api.module';

@Module({
  imports: [
    ApiModule,
    DatabaseModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      validationSchema: envVariableSchema,
      validationOptions: {
        allowUnknown: true,
      },
      ignoreEnvFile: false,
      envFilePath: ['.env'],
    }),
  ],
})
export class AppModule {}
