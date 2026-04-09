import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlsService } from './short-urls.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ShortUrlsService', () => {
  let service: ShortUrlsService;

  const prismaMock = {
    shortUrl: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.BASE_URL = 'http://localhost:3001';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortUrlsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ShortUrlsService>(ShortUrlsService);

    jest.clearAllMocks();
  });

  it('should return existing short URL if original URL already exists', async () => {
    const existing = {
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      visitCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    };

    prismaMock.shortUrl.findFirst.mockResolvedValue(existing);

    const result = await service.create({ url: 'https://example.com' });

    expect(prismaMock.shortUrl.findFirst).toHaveBeenCalled();
    expect(prismaMock.shortUrl.create).not.toHaveBeenCalled();
    expect(result.shortUrl).toBe('http://localhost:3001/abc1234');
  });

  it('should create a new short URL when none exists', async () => {
    prismaMock.shortUrl.findFirst.mockResolvedValue(null);
    prismaMock.shortUrl.create.mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'new1234',
      visitCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    });

    const result = await service.create({ url: 'https://example.com' });

    expect(prismaMock.shortUrl.create).toHaveBeenCalled();
    expect(result.shortUrl).toBe('http://localhost:3001/new1234');
  });

  it('should return all URLs with computed shortUrl field', async () => {
    prismaMock.shortUrl.findMany.mockResolvedValue([
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc1234',
        visitCount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastVisitedAt: null,
      },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].shortUrl).toBe('http://localhost:3001/abc1234');
  });

  it('should return a URL by short code', async () => {
    prismaMock.shortUrl.findUnique.mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      visitCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    });

    const result = await service.findByShortCode('abc1234');

    expect(result.shortCode).toBe('abc1234');
  });

  it('should throw NotFoundException when short code does not exist', async () => {
    prismaMock.shortUrl.findUnique.mockResolvedValue(null);

    await expect(service.findByShortCode('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should increment visit count and update lastVisitedAt', async () => {
    prismaMock.shortUrl.findUnique.mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      visitCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    });

    prismaMock.shortUrl.update.mockResolvedValue({
      id: '1',
      originalUrl: 'https://example.com',
      shortCode: 'abc1234',
      visitCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: new Date(),
    });

    const result = await service.incrementVisit('abc1234');

    expect(prismaMock.shortUrl.update).toHaveBeenCalled();
    expect(result.visitCount).toBe(1);
  });
});