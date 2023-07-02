import { Module } from '@nestjs/common';
import { MemphisModule } from 'memphis-dev';

@Module({
  imports: [MemphisModule.register()],
})
export class ConsumerModule {}
