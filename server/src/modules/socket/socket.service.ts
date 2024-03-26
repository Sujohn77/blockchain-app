import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketService {
  constructor() {
    console.log('test');
  }

  handleConnection(socket: any) {
    // this.users.set(client.id, payload.username);
    // this.broadcast(
    //   `System: ${payload.username} joined the chat.`,
    //   payload.chatId,
    // );
  }
}
