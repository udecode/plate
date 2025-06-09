import { toPlatePlugin } from '@udecode/plate/react';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
});
