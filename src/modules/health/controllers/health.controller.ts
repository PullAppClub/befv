import { Controller, Get } from '@nestjs/common';
import { VideoProducer } from '../../video/queue/producers/video.producer';

@Controller()
export class HealthController {
  constructor(private readonly videoProducer: VideoProducer) {}

  @Get()
  getHello(): string {
    this.videoProducer.videoCompressed({ message: { data: 'hello' } });
    return 'pong';
  }
}
