import { SlatePlugin } from '../../common';
import { BoldPlugin } from '../bold';
import { CodePlugin } from '../code';
import { ItalicPlugin } from '../italic';
import { StrikethroughPlugin } from '../strikethrough';
import { SubscriptPlugin } from '../subscript';
import { SuperscriptPlugin } from '../superscript';
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
