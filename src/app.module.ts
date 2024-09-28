import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { VideoModule } from './modules/video/video.module';
import { QueueModule } from './modules/common/providers/queue/queue.module';

const config = () => ({
  env: process.env.NODE_ENV,
  port: 3002,
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
  memphis: {
    host: process.env.MEMPHIS_HOST,
    port: process.env.MEMPHIS_PORT,
    username: process.env.MEMPHIS_USERNAME,
    password: process.env.MEMPHIS_PASSWORD,
  },
  queue: {
    videoProducerName: process.env.QUEUE_VIDEO_PRODUCER_NAME,
    videoConsumerName: process.env.QUEUE_VIDEO_CONSUMER_NAME,
  },
  aws: {
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    storageBaseUrl: process.env.STORAGE_BASE_URL,
    regionEndpoint: process.env.AWS_REGION_ENDPOINT,
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
    HealthModule,
    VideoModule,
    QueueModule,
  ],
  providers: [],
})
export class AppModule {}
