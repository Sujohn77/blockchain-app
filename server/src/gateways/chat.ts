import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import Web3 from 'web3';

interface ClientChatMap {
  [clientId: string]: string; // Mapping of client IDs to chat IDs
}

interface IMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  isTxid: boolean;
  transaction?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  serveClient: false,
  // namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server;
  private web3: Web3;
  private messages: Map<string, IMessage[]> = new Map();
  private logger: Logger = new Logger('ChatGateway');
  private clientChatMap: ClientChatMap = {}; // Maintain mapping of client IDs to chat IDs

  constructor() {
    const infuraEndpoint = process.env.BLOCKCHAIN_API;

    this.web3 = new Web3(infuraEndpoint);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('authClient', client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    delete this.clientChatMap[client.id]; // Remove client from the mapping upon disconnection
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, payload: { chatId: string }) {
    const { chatId } = payload;

    if (!this.clientChatMap[client.id]) {
      this.clientChatMap[client.id] = chatId;
      this.server.to(chatId).emit('log', `New user connected: ${client.id}`);
    }

    client.join(chatId);

    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
      return [];
    }

    client.emit('messages', this.messages[chatId]);
  }

  @SubscribeMessage('message:post')
  async handlePostMessage(client: Socket, payload: IMessage) {
    const chatId = this.clientChatMap[client.id]; // Get chat ID associated with the client
    if (!chatId) {
      return;
    }

    try {
      // Retrieve transaction details
      if (payload.isTxid) {
        const txid = payload.text.trim();
        const data = await this.web3.eth.getTransaction(txid);
        const block = await this.web3.eth.getBlock(data.blockNumber);
        const timestamp = block.timestamp;
        const transaction = {
          txid,
          from: data.from,
          to: data.to,
          value: this.web3.utils.fromWei(data.value, 'ether') + 'ETH',
          date: new Date(Number(timestamp) * 1000),
        };

        this.messages[chatId].push({ ...payload, transaction });
      } else {
        this.messages[chatId].push(payload);
      }

      // Broadcast the message to all clients in the chat room corresponding to the chat ID
      this.server.to(chatId).emit('messages', this.messages[chatId]);
    } catch (err) {
      console.log(err);
      return;
    }
  }
}
