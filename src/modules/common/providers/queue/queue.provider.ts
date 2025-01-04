import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';

@Injectable()
export class QueueProvider {
  private readonly redisConnection: {
    host: string;
    port: number;
    password: string;
    username?: string;
    enableTLSForSentinelMode?: boolean;
    tls?: Record<string, any>;
  };

  constructor(configService: ConfigService) {
    this.redisConnection = {
      host: configService.get('redis.host'),
      port: Number(configService.get('redis.port')),
      password: configService.get('redis.password'),
    };

    if (configService.get('redis.username')) {
      this.redisConnection['username'] = configService.get('redis.username');
    }

    if (configService.get('redis.tlsEnabled')) {
      this.redisConnection['tls'] = {};
      this.redisConnection['enableTLSForSentinelMode'] = false;
    }
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
