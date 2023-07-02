import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AwsProvider } from '../../providers/aws/aws.provider';
import { AWSError } from 'aws-sdk';

export enum FileType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  MP4 = 'video/mp4',
}

export interface UploadedFile extends File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  toBuffer: () => Promise<Buffer>;
  size: number;
}

@Injectable()
export class FileHelper {
  constructor(
    private readonly awsProvider: AwsProvider,
    private readonly logger: PinoLogger,
  ) {}

  public async upload({
    fileBuffer,
    bucket,
    filename,
  }: {
    fileBuffer: Buffer;
    filename: string;
    bucket: string;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      this.awsProvider.getS3().upload(
        this.awsProvider.createUploadFileParams({
          file: fileBuffer,
          filename,
          public: true,
          bucket,
        }),
        (err, data) => {
          if (err) {
            this.logger.info(`File upload error: ${err}`);
            reject(err.message);
          }

          this.logger.info(`File upload success: ${JSON.stringify(data)}`);
          resolve(data.Key);
        },
      );
    });
  }

  public async download(key: string, bucket: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.awsProvider
        .getS3()
        .getObject(
          this.awsProvider.createDownloadFileParams(key, bucket),
          (err: AWSError, data) => {
            if (err) {
              this.logger.info(`File download error: ${err}`);
              reject(err.message);
            }

            this.logger.info(`File download success: ${JSON.stringify(data)}`);
            resolve(data.Body as Buffer);
          },
        );
    });
  }

  /**
   * Checks mimetype and returns the file extension.
   */
  private getFileExtension(file: UploadedFile): string {
    switch (file.mimetype) {
      case FileType.PNG:
        return '.png';
      case FileType.JPEG:
        return '.jpeg';
      case FileType.MP4:
        return '.mp4';
      default:
        throw new UnsupportedMediaTypeException('ERROR.FILE_NOT_ACCEPTABLE');
    }
  }
}
