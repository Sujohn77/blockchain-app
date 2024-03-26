export const getId = () => Math.random().toString(36).slice(2);
export const isValidTxid = (input: string) => {
  const regex = /^0x([A-Fa-f0-9]{64})$/;

  return regex.test(input);
};
