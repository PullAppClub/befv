import { Injectable } from '@nestjs/common';
import { S3, Endpoint } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsProvider {
  private readonly s3Client: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3({
      endpoint: new Endpoint('ams3.digitaloceanspaces.com'), // only for digital ocean spaces
      accessKeyId: configService.get('aws.accessKeyId'),
      secretAccessKey: configService.get('aws.secretAccessKey'),
    });
  }

  public getS3(): S3 {
    return this.s3Client;
  }

  public createBaseParams(
    key: string,
    bucket: string,
  ): S3.Types.PutObjectRequest {
    return {
      Bucket: bucket,
      Key: String(key),
    };
  }

  public createUploadFileParams(params: {
    filename: string;
    file: Buffer;
    public: boolean;
    bucket: string;
  }): S3.Types.PutObjectRequest {
    return {
      Bucket: params.bucket,
      Key: String(params.filename),
      Body: params.file,
      ACL: params.public ? 'public-read' : 'private',
    };
  }

  public createDownloadFileParams(
    key: string,
    bucket: string,
  ): S3.Types.PutObjectRequest {
    return this.createBaseParams(key, bucket);
  }

  public createDeleteFileParams(
    key: string,
    bucket: string,
  ): S3.Types.PutObjectRequest {
    return this.createBaseParams(key, bucket);
  }
}
