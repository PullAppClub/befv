import { Test, TestingModule } from '@nestjs/testing';
import { AwsProvider } from './aws.provider';

describe('AwsService', () => {
  let service: AwsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsProvider],
    }).compile();

    service = module.get<AwsProvider>(AwsProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
