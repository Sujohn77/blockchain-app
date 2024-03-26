import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat';
import { SocketModule } from './modules/socket/socket.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SocketModule, ChatGateway, AppService],
})
export class AppModule {}
