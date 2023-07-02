import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { VideoProducer } from '../video/queue/producers/video.producer';

@Module({
  controllers: [HealthController],
  providers: [VideoProducer],
})
export class HealthModule {}
