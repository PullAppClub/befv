import { Injectable } from '@nestjs/common';
import { MessageBrokerProvider } from '../message-broker.provider';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ProducerProvider {
  constructor(
    private readonly queueProvider: MessageBrokerProvider,
    private readonly logger: PinoLogger,
  ) {}

  public async publishMessage(params: {
    stationName: string;
    producerName: string;
    headers?: Record<string, string>;
    message: string;
  }): Promise<void> {
    this.logger.info(
      `Publishing message to station ${params.stationName} with producer ${params.producerName}, message: ${params.message}`,
    );

    const connection = await this.queueProvider.getConnection();

    await connection.produce({
      stationName: params.stationName,
      producerName: params.producerName,
      genUniqueSuffix: false, // defaults to false
      message: params.message, // Uint8Arrays/object (schema validated station - protobuf) or Uint8Arrays/object (schema validated station - json schema) or Uint8Arrays/string/DocumentNode graphql (schema validated station - graphql schema)
      ackWaitSec: 900, // defaults to 15
      asyncProduce: true, // defaults to false
      headers: params.headers, // defults to empty
    });
  }
}
