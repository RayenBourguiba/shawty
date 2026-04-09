import { IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    {
      message: 'Please provide a valid http or https URL.',
    },
  )
  url!: string;
}