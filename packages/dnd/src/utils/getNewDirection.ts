/** Get new direction if updated */
import type { DropLineDirection } from '../types';

export const getNewDirection = (
  previousDir: string,
  dir?: string
): DropLineDirection | undefined => {
  if (!dir && previousDir) {
    return '';
  }
  if (dir === 'top' && previousDir !== 'top') {
    return 'top';
  }
  if (dir === 'bottom' && previousDir !== 'bottom') {
    return 'bottom';
  }
};
