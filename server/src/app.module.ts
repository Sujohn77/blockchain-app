import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat';
import { SocketModule } from './modules/socket/socket.module';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SocketModule, ChatGateway],
})
export class AppModule {}
