import { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { isValidTxid } from '../utils/helpers';
import { useParams, redirect } from 'react-router-dom';
import { IChatUserAtom, currentUserAtom } from '../jotai';
import { useAtom } from 'jotai';
import { SERVER_URI } from '../utils/constants';

export interface IMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  txid?: string;
  transaction?: ITransaction;
}

export interface ITransaction {
  txid: string;
  from: string;
  to: string;
  value: string;
  date: Date;
}

export interface MessageInput extends Omit<IMessage, 'id'> {}

let socket: Socket;
export const useChat = (currentUser: IChatUserAtom) => {
  const params = useParams();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [log, setLog] = useState<string>();
  const [_, setCurrentUser] = useAtom(currentUserAtom);
  useEffect(() => {
    const initSocket = async () => {
      socket = await io(SERVER_URI);

      const user = getUserFromStateOrLocalStorage();
      socket.emit('joinChat', { chatId: user.chatId });

      socket.on('log', (log: string) => {
        setLog(log);
      });

      socket.on('messages', (messages: IMessage[]) => {
        setMessages(messages);
      });

      return () => {
        socket.close();
      };
    };

    try {
      initSocket();
    } catch (err) {
      console.log(err);
    }
  }, []);

  const getUserFromStateOrLocalStorage = () => {
    const isUserInfo = !!currentUser.chatId && !!currentUser.username;
    const localStorageUser = localStorage.getItem('userInfo');

    if (isUserInfo) {
      return currentUser;
    }

    if (localStorageUser) {
      const parsedUser = JSON.parse(localStorageUser);

      if (parsedUser.chatId != params.id) return;

      setCurrentUser(parsedUser);
      return parsedUser;
    }

    redirect('/login');
  };

  const send = useCallback((payload: MessageInput) => {
    socket.emit('message:post', {
      ...payload,
      isTxid: isValidTxid(payload.text),
    });
  }, []);

  return { messages, log, chatActions: { send } };
};
