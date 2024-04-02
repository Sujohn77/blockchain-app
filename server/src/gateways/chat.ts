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
import * as bcrypt from 'bcrypt';
import { getId } from 'src/utils/helpers';
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

interface IUser {
  userId: string;
  username: string;
  token: string;
  chatId: string;
}

const saltRounds = 10;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  serveClient: false,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server;
  private web3: Web3;
  private messages: Map<string, IMessage[]> = new Map();
  private logger: Logger = new Logger('ChatGateway');
  private clientChatMap: ClientChatMap = {}; // Maintain mapping of client IDs to chat IDs
  private users: IUser[] = [];

  constructor() {
    const infuraEndpoint = process.env.BLOCKCHAIN_API;
    this.web3 = new Web3(infuraEndpoint);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    delete this.clientChatMap[client.id]; // Remove client from the mapping upon disconnection
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    client: Socket,
    payload: { chatId: string; username: string; token: string },
  ) {
    const { chatId, username, token } = payload;

    const existingUser = this.users.find(
      (user) =>
        user.username === username &&
        user.token === token &&
        user.chatId == chatId,
    );
    client.join(chatId);

    if (!existingUser) {
      const userId = getId();
      this.server.to(chatId).emit('log', `New user connected: ${client.id}`);
      this.users.push({ userId, username, token, chatId });
      client.emit('currentUserId', userId);
    } else {
      client.emit('currentUserId', existingUser.userId);
    }

    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
      return [];
    }

    client.emit('messages', this.messages[chatId]);
  }

  @SubscribeMessage('message:post')
  async handlePostMessage(
    client: Socket,
    payload: IMessage & { token: string },
  ) {
    const { token, userId, username } = payload;
    const user = this.users.find(
      (user) =>
        user.userId == userId &&
        user.token == token &&
        user.username == username,
    );

    if (!user?.chatId) {
      return;
    }

    const chatId = user.chatId;
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

        this.messages[chatId].push({
          ...payload,
          transaction,
        });
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
