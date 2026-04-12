export type { Encoding, Token, Value } from 'micromark-util-types';
export type {
  CompileContext,
  CompileData,
  Extension,
  Handles,
  Handle,
  OnEnterError,
  OnExitError,
  Options,
  Transform,
} from './lib/types.js';
export { fromMarkdown } from './lib/index.js';

declare module 'micromark-util-types' {
  type TokenTypeMap = {
    listItem: 'listItem';
  };

  type Token = {
    _spread?: boolean;
  };
}
