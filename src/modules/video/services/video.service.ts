import { Injectable } from '@nestjs/common';
import { FileHelper } from '../../common/helpers/file/file.helper';
import ffmpeg from 'fluent-ffmpeg';
import { PinoLogger } from 'nestjs-pino';
import * as fs from 'fs';

@Injectable()
export class VideoService {
  constructor(
    private readonly fileHelper: FileHelper,
    private readonly logger: PinoLogger,
  ) {}

  public async handleVideoCompression(params: {
    inputPath: string;
    bucket: string;
  }): Promise<string> {
    await this.fileHelper.download(params.inputPath, params.bucket);
    const compressedVideoPath = await this.compressVideo(params.inputPath);

    return await this.fileHelper.upload({
      fileBuffer: fs.readFileSync(compressedVideoPath),
      bucket: 'videos',
      filename: compressedVideoPath,
    });
  }

  private async compressVideo(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = inputPath.replace('.mp4', '-compressed.mp4');

      ffmpeg(inputPath)
        .outputOptions('-c:v libx264', '-crf 24') // Video codec and quality option
        .output(outputPath)
        .on('end', () => {
          this.logger.info(`Compression finished. Output video: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          this.logger.error('Error during compression:', err.message);
          reject(err.message);
        })
        .run();
    });
  }
}
