import { Module } from '@nestjs/common';
import { ChatGateway } from './gateways/chat';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [],
  controllers: [],
  providers: [SocketModule, ChatGateway],
})
export class AppModule {}
