import { Test, TestingModule } from '@nestjs/testing';
import { RedirectsController } from './redirects.controller';
import { ShortUrlsService } from '../short-urls/short-urls.service';

describe('RedirectsController', () => {
  let controller: RedirectsController;

  const mockShortUrlsService = {
    findByShortCode: jest.fn(),
    incrementVisit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirectsController],
      providers: [
        {
          provide: ShortUrlsService,
          useValue: mockShortUrlsService,
        },
      ],
    }).compile();

    controller = module.get<RedirectsController>(RedirectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});