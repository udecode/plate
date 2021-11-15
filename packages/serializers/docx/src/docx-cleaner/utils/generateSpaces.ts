import { SPACE } from '../constants';

export const generateSpaces = (count: number): string =>
  Array.from({ length: count }, () => SPACE).join('');
