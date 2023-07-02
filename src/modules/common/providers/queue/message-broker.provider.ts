import { Injectable, OnModuleInit } from '@nestjs/common';
import { Memphis, MemphisService } from 'memphis-dev';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MessageBrokerProvider implements OnModuleInit {
  private memphisConnection: Memphis;

  constructor(
    private readonly memphis: MemphisService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  onModuleInit() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      const host = this.configService.get('memphis.host');
      const username = this.configService.get('memphis.username');
      const password = this.configService.get('memphis.password');
      const port = this.configService.get('memphis.port');

      this.memphisConnection = await this.memphis.connect({
        host,
        port: Number(port),
        username,
        password,
        reconnect: true, // defaults to true
        maxReconnect: 3, // defaults to 3
        reconnectIntervalMs: 1500, // defaults to 1500
        timeoutMs: 1500, // defaults to 1500
      });
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  public async getConnection(): Promise<Memphis> {
    if (!this.memphisConnection) {
      await this.initializeConnection();
    }

    return this.memphisConnection;
  }
}
