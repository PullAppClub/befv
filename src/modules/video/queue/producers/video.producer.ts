import { Injectable } from '@nestjs/common';
import { ProducerProvider } from '../../../common/providers/queue/producer/producer.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoProducer {
  private producerName: string;
  constructor(
    private readonly producerProvider: ProducerProvider,
    private readonly configService: ConfigService,
  ) {
    this.producerName = configService.get('queue.videoProducerName');
  }

  public async videoCompressed(params: {
    message: Record<any, any>;
  }): Promise<void> {
    await this.producerProvider.publishMessage({
      stationName: 'video',
      producerName: this.producerName,
      message: JSON.stringify(params.message),
    });
  }
}
