import { Global, Module } from '@nestjs/common';
import { ProducerProvider } from './producer/producer.provider';
import { ConsumerModule } from './consumer/consumer.module';
import { MessageBrokerProvider } from './message-broker.provider';
import { QueueProvider } from './queue.provider';

@Global()
@Module({
  imports: [ConsumerModule],
  providers: [ProducerProvider, MessageBrokerProvider, QueueProvider],
  exports: [ProducerProvider, MessageBrokerProvider, QueueProvider],
})
export class QueueModule {}
