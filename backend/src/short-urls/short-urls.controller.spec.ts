import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlsController } from './short-urls.controller';

describe('ShortUrlsController', () => {
  let controller: ShortUrlsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortUrlsController],
    }).compile();

    controller = module.get<ShortUrlsController>(ShortUrlsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
