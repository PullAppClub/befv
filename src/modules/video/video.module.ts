import { Module } from '@nestjs/common';
import { VideoProducer } from './queue/producers/video.producer';
import { VideoWorker } from './queue/workers/video.worker';
import { VideoService } from './services/video.service';
import { FileHelper } from '../common/helpers/file/file.helper';
import { AwsProvider } from '../common/providers/aws/aws.provider';

@Module({
  imports: [],
  providers: [
    VideoProducer,
    VideoWorker,
    VideoService,
    FileHelper,
    AwsProvider,
  ],
})
export class VideoModule {}
