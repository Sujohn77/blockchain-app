import { MESSAGES_TOKEN } from "./constants";

export const getId = () => Math.random().toString(36).slice(2);
export const isValidTxid = (input: string) => {
  const regex = /^0x([A-Fa-f0-9]{64})$/;

  return regex.test(input);
};

export const getLocalStorageObject = (key: string) => {
  const item = localStorage.getItem(key);
  return item && JSON.parse(item);
};

export const getMessagesToken = () => {
  const existingToken = localStorage.getItem(MESSAGES_TOKEN);
  if (existingToken) return existingToken;

  const token = getId();
  localStorage.setItem(MESSAGES_TOKEN, token);
  return token;
};
