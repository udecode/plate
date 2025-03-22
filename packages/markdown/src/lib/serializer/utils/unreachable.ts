import { warn } from 'node:console';

export const unreachable = (value: any) => {
  warn(`Unreachable code: ${value}`);
};
