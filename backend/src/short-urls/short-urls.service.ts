import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { generateRandomShortCode } from './utils/short-code.generator';
import type { ShortUrl } from '@prisma/client';

@Injectable()
export class ShortUrlsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createShortUrlDto: CreateShortUrlDto) {
    const { url } = createShortUrlDto;

    const existing = await this.prisma.shortUrl.findFirst({
      where: { originalUrl: url },
    });

    if (existing) {
      return {
        ...existing,
        shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`,
      };
    }

    const maxRetries = 5;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const shortCode = generateRandomShortCode(7);

      try {
        const created = await this.prisma.shortUrl.create({
          data: {
            originalUrl: url,
            shortCode,
          },
        });

        return {
          ...created,
          shortUrl: `${process.env.BASE_URL}/${created.shortCode}`,
        };
      } catch (error: any) {
        if (error?.code === 'P2002') {
          continue;
        }

        throw new InternalServerErrorException('Failed to create short URL.');
      }
    }

    throw new ConflictException(
      'Could not generate a unique short code. Please try again.',
    );
  }

  async findAll() {
    const items = await this.prisma.shortUrl.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items.map((item) => ({
      ...item,
      shortUrl: `${process.env.BASE_URL}/${item.shortCode}`,
    }));
  }

  async findByShortCode(shortCode: string): Promise<ShortUrl> {
    const item = await this.prisma.shortUrl.findUnique({
      where: { shortCode },
    });

    if (!item) {
      throw new NotFoundException('Short URL not found.');
    }

    return item;
  }

  async incrementVisit(shortCode: string): Promise<ShortUrl> {
    await this.findByShortCode(shortCode);

    return this.prisma.shortUrl.update({
      where: { shortCode },
      data: {
        visitCount: {
          increment: 1,
        },
        lastVisitedAt: new Date(),
      },
    });
  }
}