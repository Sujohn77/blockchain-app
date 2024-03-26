import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
// import { ChatGateway } from 'src/gateways/chat';

@Module({ imports: [SocketService], providers: [SocketService] })
export class SocketModule {}
