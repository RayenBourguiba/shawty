import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ShortUrlsService } from '../short-urls/short-urls.service';

@Controller()
export class RedirectsController {
  constructor(private readonly shortUrlsService: ShortUrlsService) {}

  @Get(':shortCode')
  async redirectToOriginal(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    const item = await this.shortUrlsService.findByShortCode(shortCode);

    if (!item) {
      throw new NotFoundException('Short URL not found.');
    }

    await this.shortUrlsService.incrementVisit(shortCode);

    return res.redirect(302, item.originalUrl);
  }
}