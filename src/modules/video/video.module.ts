import { Module } from '@nestjs/common';
import { VideoQueue } from './queue/video.queue';
import { VideoWorker } from './queue/video.worker';
import { VideoService } from './services/video.service';
import { FileHelper } from '../common/helpers/file/file.helper';
import { AwsProvider } from '../common/providers/aws/aws.provider';

@Module({
  imports: [],
  providers: [VideoQueue, VideoWorker, VideoService, FileHelper, AwsProvider],
})
export class VideoModule {}
