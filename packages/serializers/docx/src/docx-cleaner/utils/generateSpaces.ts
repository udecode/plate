import { SPACE, TAB } from '@udecode/plate-core';

export const generateSpaces = (count: number): string =>
  Array.from({ length: count }, () => SPACE).join('');

export const generateTabs = (count: number): string =>
  Array.from({ length: count }, () => TAB).join('');
