import { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  getLocalStorageObject,
  getMessagesToken,
  isValidTxid,
} from "../utils/helpers";
import { redirect } from "react-router-dom";
import { IChatUserAtom, currentUserAtom } from "../jotai";
import { useAtom } from "jotai";
import { SERVER_URI, USERS_KEY } from "../utils/constants";

export interface IMessage {
  id: string;
  userId?: string;
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

export interface ILocalUser {
  userId: string;
  username: string;
}

export interface MessageInput extends Omit<IMessage, "id"> {}

let socket: Socket;
export const useChat = (currentUser: IChatUserAtom) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [log, setLog] = useState<string>();
  const [_, setCurrentUser] = useAtom(currentUserAtom);

  useEffect(() => {
    const initSocket = async () => {
      socket = await io(SERVER_URI);

      const token = getMessagesToken();
      const user = getUserOrRedirect();
      user &&
        socket.emit("joinChat", {
          chatId: user.chatId,
          username: user.username,
          token,
        });

      socket.on("log", (log: string) => {
        setLog(log);
      });

      socket.on("currentUserId", (id: string) => {
        setCurrentUser({ ...currentUser, userId: id });
        handleAuthChatUser(id);
      });

      socket.on("messages", (messages: IMessage[]) => {
        console.log(messages);
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

  const handleAuthChatUser = (userId: string) => {
    const localChatUsers: ILocalUser[] = getLocalStorageObject(USERS_KEY) || [];

    const existingUser = localChatUsers.find(
      (localUser) => localUser.userId == userId
    );

    if (!existingUser) {
      const newUser = {
        userId,
        username: currentUser.username,
      };
      localStorage.setItem(
        USERS_KEY,
        JSON.stringify([...localChatUsers, newUser])
      );
    }

    setCurrentUser({
      ...currentUser,
      userId: existingUser ? existingUser.userId : userId,
    });
  };

  const getUserOrRedirect = () => {
    const isUserInfo = !!currentUser.chatId && !!currentUser.username;
    // const localStorageUser = localStorage.getItem('userInfo');

    if (isUserInfo) {
      return currentUser;
    }

    redirect("/login");
  };

  const send = useCallback((payload: MessageInput) => {
    const token = getMessagesToken();
    socket.emit("message:post", {
      ...payload,
      isTxid: isValidTxid(payload.text),
      token,
    });
  }, []);

  return { messages, log, chatActions: { send } };
};
