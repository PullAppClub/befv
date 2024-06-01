import { Injectable } from '@nestjs/common';
import { QueueProvider } from '../../common/providers/queue/queue.provider';

@Injectable()
export class VideoQueue {
  private readonly videoCompressedQueue =
    this.queueProvider.createQueue('VideoCompressed');

  constructor(private readonly queueProvider: QueueProvider) {}

  public async videoCompressed(params: Record<any, any>): Promise<void> {
    await this.videoCompressedQueue.add('video_compressed', params, {
      attempts: 5,
      removeOnComplete: true,
    });
  }
}
