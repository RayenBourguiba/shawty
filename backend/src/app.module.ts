import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ShortUrlsModule } from './short-urls/short-urls.module';
import { RedirectsController } from './redirects/redirects.controller';

@Module({
  imports: [PrismaModule, ShortUrlsModule],
  controllers: [RedirectsController],
})
export class AppModule {}