import { Global, Module } from '@nestjs/common';
import { QueueProvider } from './queue.provider';

@Global()
@Module({
  providers: [QueueProvider],
  exports: [QueueProvider],
})
export class QueueModule {}
