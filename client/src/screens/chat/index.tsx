import React, { useState, useEffect } from 'react';

import { IMessage, ITransaction, useChat } from '../../hooks/useChat';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../../jotai';
import { getId } from '../../utils/helpers';

const notify = (message: string) =>
  toast.info(message, {
    position: 'top-left',
    autoClose: 1000,
    hideProgressBar: true,
    transition: Slide,
  });

const Chat: React.FC = () => {
  const [userInfo] = useAtom(currentUserAtom);

  const { chatActions, messages, log } = useChat(userInfo);

  const [messageText, setMessageText] = useState<string>('');

  useEffect(() => {
    if (!log) return;

    notify(log);
  }, [log]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const { userId, username } = userInfo;
    const trimmedText = messageText.trim();
    if (!trimmedText) return;

    const message = {
      id: getId(),
      userId,
      username,
      text: trimmedText,
    };

    chatActions.send(message);
    setMessageText('');
  };

  const renderMessage = (message: IMessage) => {
    const isOwnMessage = message.userId === userInfo.userId;
    const customStyles = isOwnMessage
      ? 'self-end bg-green-500'
      : 'self-start bg-blue-500';

    return (
      <div
        key={message.id}
        className={[
          'my-2 p-2 rounded-md text-white flex flex-col items-start',
          customStyles,
        ].join(' ')}
      >
        <b className="text-sm mb-1">By {message.username}:</b>

        <div>{message.text}</div>
        {message.transaction && renderTransactionDetails(message.transaction)}
      </div>
    );
  };

  const renderTransactionDetails = (transaction: ITransaction) => {
    return (
      <div className="my-2 bg-blue-500 p-1 px-2 rounded-xl flex flex-col items-start text-sm">
        <b className="text-xl mb-2">Transaction: </b>
        <div>
          <b>Txid: </b>
          <span>{transaction.txid}</span>
        </div>
        <div>
          <b>From: </b>
          <span>{transaction.from}</span>
        </div>
        <div>
          <b>To: </b>
          <span>{transaction.to}</span>
        </div>
        <div>
          <b>ETH sent: </b>
          <span>{transaction.value}</span>
        </div>
        <div>
          <b>Date: </b>
          <span>{new Date(transaction.date).toISOString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div>Chat Messages:</div>
      <div className="h-[600px] max-w-[100%] w-[600px] overflow-y-scroll mt-3 grid grid-rows-[1fr_min-content]">
        <span className="text-xs max-w-[100%]">
          (To retrieve transaction details, please input the transaction ID in
          the following field: e.g.,
          0x87bb9c91edea8a9c22341baa8df5b01cc7b77f35f9d7510f9abe0b9fbf64ea5a)
        </span>
        <div> {messages.map(renderMessage)}</div>
      </div>
      <div className="flex justify-between">
        <input
          className="w-4/5 px-3"
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message"
        />
        <button className="w-1/5" onClick={sendMessage}>
          Send
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Chat;
