import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 10048576 }),
  );

  const options = {
    origin: process.env.ENV !== 'prod' ? '*' : 'pullapp.club',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(options);

  // set header for all requests with fastify's instance
  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', (request, reply, done) => {
      reply.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, enctype',
      );
      reply.header('access-control-expose-headers', 'Authorization');
      done();
    });

  const logger = app.get(Logger);
  app.useLogger(logger); //use nestjs-pino for app logging

  await app.listen(process.env.ENV === 'dev' ? 3002 : 3000, '0.0.0.0');
}
bootstrap();
