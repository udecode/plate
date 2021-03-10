import { SlatePlugin } from '@udecode/slate-plugins-core';
import { BoldPlugin } from '../bold/BoldPlugin';
import { CodePlugin } from '../code/CodePlugin';
import { ItalicPlugin } from '../italic/ItalicPlugin';
import { StrikethroughPlugin } from '../strikethrough/StrikethroughPlugin';
import { SubscriptPlugin } from '../subsupscript/subscript/SubscriptPlugin';
import { SuperscriptPlugin } from '../subsupscript/superscript/SuperscriptPlugin';
import { UnderlinePlugin } from '../underline/UnderlinePlugin';

/**
 * Enables support for basic marks:
 * - Bold
 * - Code
 * - Italic
 * - Strikethrough
 * - Subscript
 * - Superscript
 * - Underline
 */
export const BasicMarkPlugins = (): SlatePlugin[] => [
  BoldPlugin(),
  CodePlugin(),
  ItalicPlugin(),
  StrikethroughPlugin(),
  SubscriptPlugin(),
  SuperscriptPlugin(),
  UnderlinePlugin(),
];
