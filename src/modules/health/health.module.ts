import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { VideoQueue } from '../video/queue/video.queue';

@Module({
  controllers: [HealthController],
  providers: [VideoQueue],
})
export class HealthModule {}
