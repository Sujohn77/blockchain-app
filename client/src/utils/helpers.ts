export const getId = () => Math.random().toString(36).slice(2);
export const isValidTxid = (input: string) => {
  const regex = /^0x([A-Fa-f0-9]{64})$/;

  return regex.test(input);
};

export const getLocalStorageObject = (key: string) => {
  const item = localStorage.getItem(key);
  return item && JSON.parse(item);
};
