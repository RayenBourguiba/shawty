import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlsController } from './short-urls.controller';
import { ShortUrlsService } from './short-urls.service';

describe('ShortUrlsController', () => {
  let controller: ShortUrlsController;

  const mockShortUrlsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByShortCode: jest.fn(),
    incrementVisit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortUrlsController],
      providers: [
        {
          provide: ShortUrlsService,
          useValue: mockShortUrlsService,
        },
      ],
    }).compile();

    controller = module.get<ShortUrlsController>(ShortUrlsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});