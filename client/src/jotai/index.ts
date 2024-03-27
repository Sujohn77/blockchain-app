import { atom } from 'jotai';

export interface IChatUserAtom {
  userId?: string;
  username: string;
  chatId: number | null;
}
export const defaultAppState = {
  username: '',
  chatId: null,
};
export const currentUserAtom = atom<IChatUserAtom>(defaultAppState);
