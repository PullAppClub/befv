import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueProvider } from '../../../common/providers/queue/queue.provider';
import { VideoService } from '../../services/video.service';

@Injectable()
export class VideoWorker {
  private readonly videoWorker = this.queueProvider.createWorker({
    name: 'Video',
    processor: (job: Job) => this.videoHandler(job),
  });

  constructor(
    private readonly queueProvider: QueueProvider,
    private readonly videoService: VideoService,
  ) {}

  public async videoHandler({
    data,
  }: Job<{ bucket: string; videoName: string }>): Promise<void> {
    await this.videoService.handleVideoCompression({
      bucket: data.bucket,
      inputPath: data.videoName,
    });
  }
}
