import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';

@Injectable()
export class QueueProvider {
  private readonly redisConnection: { host: string; port: number };

  constructor(configService: ConfigService) {
    this.redisConnection = {
      host: configService.get('redis.host'),
      port: configService.get('redis.port'),
    };
  }

  public createQueue(name: string): Queue {
    return new Queue(name, { connection: this.redisConnection });
  }

  public createWorker(params: {
    name: string;
    processor: (job: Job) => Promise<void>;
  }): Worker {
    return new Worker(params.name, params.processor, {
      connection: this.redisConnection,
    });
  }
}
