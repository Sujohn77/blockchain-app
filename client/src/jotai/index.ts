import { atom } from 'jotai';
import { getId } from '../utils/helpers';

export interface IChatUserAtom {
  userId: string;
  username: string;
  chatId: number | null;
}
export const defaultAppState = {
  userId: getId(),
  username: '',
  chatId: null,
};
export const currentUserAtom = atom<IChatUserAtom>(defaultAppState);
