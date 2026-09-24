import { Test, TestingModule } from '@nestjs/testing';
import { CannedResponsesService } from './canned-responses.service';

describe('CannedResponsesService', () => {
  let service: CannedResponsesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CannedResponsesService],
    }).compile();

    service = module.get<CannedResponsesService>(CannedResponsesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
