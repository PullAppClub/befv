import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueProvider } from '../../common/providers/queue/queue.provider';
import { VideoService } from '../services/video.service';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class VideoWorker {
  private readonly videoWorker = this.queueProvider.createWorker({
    name: 'VideoToCompress',
    processor: (job: Job) => this.videoHandler(job),
  });

  constructor(
    private readonly queueProvider: QueueProvider,
    private readonly videoService: VideoService,
    private readonly logger: PinoLogger,
  ) {
    this.videoWorker.on('completed', (job: Job) => {
      logger.info(`Job ${job.id} completed`);
    });
  }

  public async videoHandler({
    data,
  }: Job<{ bucket: string; videoName: string }>): Promise<void> {
    try {
      await this.videoService.handleVideoCompression({
        bucket: data.bucket,
        inputPath: data.videoName,
      });
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
