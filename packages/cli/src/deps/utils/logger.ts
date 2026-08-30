import { cyan, green, red, yellow } from 'kleur/colors';

export const highlighter = {
  error: red,
  info: cyan,
  success: green,
  warn: yellow,
};

export const logger = {
  break() {
    console.info('');
  },
  error(...args: unknown[]) {
    console.info(highlighter.error(args.join(' ')));
  },
  info(...args: unknown[]) {
    console.info(highlighter.info(args.join(' ')));
  },
  log(...args: unknown[]) {
    console.info(args.join(' '));
  },
  success(...args: unknown[]) {
    console.info(highlighter.success(args.join(' ')));
  },
  warn(...args: unknown[]) {
    console.info(highlighter.warn(args.join(' ')));
  },
};
