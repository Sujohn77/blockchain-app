import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  const port = process.env.PORT || 3001;
  await app
    .listen(port)
    .then(() => console.log(`Server is running on ${port}!`));
}

bootstrap();
