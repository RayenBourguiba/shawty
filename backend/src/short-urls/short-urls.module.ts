import { Module } from '@nestjs/common';
import { ShortUrlsController } from './short-urls.controller';
import { ShortUrlsService } from './short-urls.service';

@Module({
  controllers: [ShortUrlsController],
  providers: [ShortUrlsService],
  exports: [ShortUrlsService],
})
export class ShortUrlsModule {}