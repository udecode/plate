import { SlatePlugin } from 'common/types';
import { BasicMarkPluginsOptions } from 'marks/basic-marks/types';
import { BoldPlugin } from 'marks/bold';
import { CodePlugin } from 'marks/code';
import { ItalicPlugin } from 'marks/italic';
import { StrikethroughPlugin } from 'marks/strikethrough';
import { SubscriptPlugin } from 'marks/subscript';
import { SuperscriptPlugin } from 'marks/superscript';
import { UnderlinePlugin } from 'marks/underline';

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
