import { cyan, green, red, yellow } from 'kleur/colors';

export const highlighter = {
  error: red,
  info: cyan,
  success: green,
  warn: yellow,
};

export const logger = {
  break() {
    console.log('');
  },
  error(...args: unknown[]) {
    console.log(highlighter.error(args.join(' ')));
  },
  info(...args: unknown[]) {
    console.log(highlighter.info(args.join(' ')));
  },
  log(...args: unknown[]) {
    console.log(args.join(' '));
  },
  success(...args: unknown[]) {
    console.log(highlighter.success(args.join(' ')));
  },
  warn(...args: unknown[]) {
    console.log(highlighter.warn(args.join(' ')));
  },
};
