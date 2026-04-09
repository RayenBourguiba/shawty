import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('URL Shortener API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.BASE_URL = 'http://localhost:3001';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    prisma = app.get(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    await prisma.shortUrl.deleteMany();
  });

  afterAll(async () => {
    await prisma.shortUrl.deleteMany();
    await app.close();
  });

  it('POST /api/urls should create a short URL', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/urls')
      .send({ url: 'https://example.com/page' })
      .expect(201);

    expect(response.body.originalUrl).toBe('https://example.com/page');
    expect(response.body.shortCode).toHaveLength(7);
    expect(response.body.shortUrl).toContain('http://localhost:3001/');
  });

  it('POST /api/urls should reject invalid URLs', async () => {
    await request(app.getHttpServer())
      .post('/api/urls')
      .send({ url: 'not-a-url' })
      .expect(400);
  });

  it('GET /api/urls should list created URLs', async () => {
    await request(app.getHttpServer())
      .post('/api/urls')
      .send({ url: 'https://example.com/page1' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/urls')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it('GET /:shortCode should redirect to the original URL', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/urls')
      .send({ url: 'https://example.com/redirect-test' })
      .expect(201);

    const shortCode = createResponse.body.shortCode;

    const redirectResponse = await request(app.getHttpServer())
      .get(`/${shortCode}`)
      .expect(302);

    expect(redirectResponse.headers.location).toBe(
      'https://example.com/redirect-test',
    );
  });

  it('GET /api/urls/:shortCode should return details', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/urls')
      .send({ url: 'https://example.com/details' })
      .expect(201);

    const shortCode = createResponse.body.shortCode;

    const response = await request(app.getHttpServer())
      .get(`/api/urls/${shortCode}`)
      .expect(200);

    expect(response.body.shortCode).toBe(shortCode);
    expect(response.body.originalUrl).toBe('https://example.com/details');
  });

  it('GET /missingCode should return 404', async () => {
    await request(app.getHttpServer()).get('/missing12').expect(404);
  });
});