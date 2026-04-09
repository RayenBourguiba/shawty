import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlsService } from './short-urls.service';

describe('ShortUrlsService', () => {
  let service: ShortUrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortUrlsService],
    }).compile();

    service = module.get<ShortUrlsService>(ShortUrlsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
