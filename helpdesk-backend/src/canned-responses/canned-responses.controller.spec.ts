import { Test, TestingModule } from '@nestjs/testing';
import { CannedResponsesController } from './canned-responses.controller';

describe('CannedResponsesController', () => {
  let controller: CannedResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CannedResponsesController],
    }).compile();

    controller = module.get<CannedResponsesController>(CannedResponsesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
