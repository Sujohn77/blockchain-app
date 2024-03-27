import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [ChatGateway, AppService],
})
export class AppModule {}
