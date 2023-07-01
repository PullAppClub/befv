import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';

const config = () => ({
  env: process.env.NODE_ENV,
  port: 3000,
  logger: {
    level: process.env.LOGGER_LEVEL || 'info',
    log: {
      requests: true,
      queries: false,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: process.env.ENV_FILE,
    }),
    LoggerModule.forRootAsync({
      providers: [ConfigService],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get('logger.level'),
          transport: {
            target: 'pino-pretty',
            options: {
              levelFirst: true,
              colorize: true,
              translateTime: true,
              singleLine: true,
            },
          },
        },
        exclude: configService.get('logger.log.requests') ? [] : ['/(.*)'],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
