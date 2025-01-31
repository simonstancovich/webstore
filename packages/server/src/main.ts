import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'body-parser';
import { IncomingMessage, ServerResponse } from 'http';

interface RawBodyRequest extends IncomingMessage {
  originalUrl?: string;
  rawBody?: Buffer;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(
    json({
      limit: '1mb',
      verify: (req: IncomingMessage, res: ServerResponse, buf: Buffer) => {
        const typedReq = req as RawBodyRequest;

        if (typedReq.originalUrl === '/stripe/webhook') {
          typedReq.rawBody = buf;
        }
      },
    }),
  );

  app.use(urlencoded({ extended: true }));

  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
