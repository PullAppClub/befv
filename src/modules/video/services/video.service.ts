import { Injectable } from '@nestjs/common';
import { FileHelper } from '../../common/helpers/file/file.helper';
import * as ffmpeg from 'fluent-ffmpeg';
import { PinoLogger } from 'nestjs-pino';
import * as fs from 'fs';
import { VideoQueue } from '../queue/video.queue';
import * as path from 'path';
import { uuidv7 as uuid } from 'uuidv7';

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
      videoName: path.basename(compressedVideoPath),
      thumbnailName: path.basename(thumbnailPath),
      originalVideoName: path.basename(params.inputPath),
      videoType: params.videoType,
    });

    await Promise.all([
      this.removeFile(compressedVideoPath),
      this.removeFile(thumbnailPath),
      this.removeFile(params.inputPath),
    ]);

    await this.fileHelper.download(params.inputPath, params.bucket);
  }

  private async uploadFileToStorage(
    filePath: string,
    bucket: string,
  ): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    if (fileBuffer.length === 0) {
      throw new Error(`File buffer is empty: ${filePath}`);
    }

    this.logger.info(
      `Uploading file: ${filePath}, size: ${(
        fileBuffer.length /
        (1024 * 1024)
      ).toFixed(2)} mb`,
    );

    await this.fileHelper.upload({
      fileBuffer,
      bucket: bucket,
      filename: path.basename(filePath),
    });
  }

  private async removeFile(filePath: string): Promise<void> {
    await fs.unlink(filePath, (err) => {
      if (err) this.logger.error(err.message);
    });
  }

  private async compressVideo(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `${uuid()}.mp4`;

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
    const outputPath = `${uuid()}.jpg`;
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
