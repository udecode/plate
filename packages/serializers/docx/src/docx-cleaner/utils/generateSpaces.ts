import { SPACE, TAB } from '@udecode/plate-common';

export const generateSpaces = (count: number): string =>
  Array.from({ length: count }, () => SPACE).join('');

export const generateTabs = (count: number): string =>
  Array.from({ length: count }, () => TAB).join('');
