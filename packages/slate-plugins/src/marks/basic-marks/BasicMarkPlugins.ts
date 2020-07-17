import { SlatePlugin } from '@udecode/slate-plugins-core';
import { BoldPlugin } from '../bold';
import { CodePlugin } from '../code';
import { ItalicPlugin } from '../italic';
import { StrikethroughPlugin } from '../strikethrough';
import { SubscriptPlugin } from '../subsupscript/subscript/SubscriptPlugin';
import { SuperscriptPlugin } from '../subsupscript/superscript/SuperscriptPlugin';
import { UnderlinePlugin } from '../underline';
import { BasicMarkPluginsOptions } from './types';

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
export const BasicMarkPlugins = (
  options?: BasicMarkPluginsOptions
): SlatePlugin[] => [
  BoldPlugin(options),
  CodePlugin(options),
  ItalicPlugin(options),
  StrikethroughPlugin(options),
  SubscriptPlugin(options),
  SuperscriptPlugin(options),
  UnderlinePlugin(options),
];
