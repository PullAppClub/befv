import { Injectable } from '@nestjs/common';
import { FileHelper } from '../../common/helpers/file/file.helper';
import * as ffmpeg from 'fluent-ffmpeg';
// import * as ffmpeg from 'ffmpeg';

import { PinoLogger } from 'nestjs-pino';
import * as fs from 'fs';
import { VideoQueue } from '../queue/video.queue';

@Injectable()
export class VideoService {
  constructor(
    private readonly fileHelper: FileHelper,
    private readonly logger: PinoLogger,
    private readonly videoProducer: VideoQueue,
  ) {}

  public async handleVideoCompression(params: {
    inputPath: string;
    bucket: string;
    videoType: string;
  }): Promise<void> {
    const content = await this.fileHelper.download(
      params.inputPath,
      params.bucket,
    );

    fs.writeFileSync(params.inputPath, content);

    const compressedVideoPath = await this.compressVideo(params.inputPath);
    const thumbnailPath = await this.createThumbnail(params.inputPath);

    await Promise.all([
      this.uploadFileToStorage(compressedVideoPath, params.bucket),
      this.uploadFileToStorage(thumbnailPath, params.bucket),
    ]);

    await this.videoProducer.videoCompressed({
      bucket: params.bucket,
      videoName: compressedVideoPath,
      thumbnailName: thumbnailPath,
      originalVideoName: params.inputPath,
      videoType: params.videoType,
    });

    await Promise.all([
      this.removeFile(compressedVideoPath),
      this.removeFile(thumbnailPath),
      this.removeFile(params.inputPath),
    ]);
  }

  private async uploadFileToStorage(
    filePath: any,
    bucket: string,
  ): Promise<void> {
    await this.fileHelper.upload({
      fileBuffer: fs.readFileSync(filePath),
      bucket: bucket,
      filename: filePath,
    });
  }

  private async removeFile(filePath: string): Promise<void> {
    await fs.unlink(filePath, (err) => {
      if (err) this.logger.error(err.message);
    });
  }

  private async compressVideo(inputPath: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const outputPath = inputPath.replace('.mp4', '-compressed.mp4');

      ffmpeg(inputPath)
        .videoCodec('libx264')
        .outputOptions([
          '-c:v libx264',
          '-crf 28', // Target video quality (adjust as needed)
          '-preset ultrafast',
        ])
        .output(outputPath)
        .on('end', () => {
          this.logger.info(`Compression finished. Output video: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          this.logger.error(`Error during compression: ${err.message}`);
          reject(err.message);
        })
        .run();
    });
  }

  private async createThumbnail(videoPath: string): Promise<string> {
    const outputPath = videoPath.replace('.mp4', '-thumbnail.jpg');

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          filename: outputPath,
        })
        .on('error', (err) => {
          this.logger.error(`Error generating thumbnail:  ${err}`);
          reject(err.message);
        })
        .on('end', () => {
          this.logger.info(`Thumbnail generated: ${outputPath}`);
          resolve(outputPath);
        });
    });
  }
}
