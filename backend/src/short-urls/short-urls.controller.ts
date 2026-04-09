import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ShortUrlsService } from './short-urls.service';
import { CreateShortUrlDto } from './dto/create-short-url.dto';

@Controller('api/urls')
export class ShortUrlsController {
  constructor(private readonly shortUrlsService: ShortUrlsService) {}

  @Post()
  create(@Body() createShortUrlDto: CreateShortUrlDto) {
    return this.shortUrlsService.create(createShortUrlDto);
  }

  @Get()
  findAll() {
    return this.shortUrlsService.findAll();
  }

  @Get(':shortCode')
  findOne(@Param('shortCode') shortCode: string) {
    return this.shortUrlsService.findByShortCode(shortCode);
  }
}