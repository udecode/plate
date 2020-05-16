import { MarkPluginOptions } from 'mark';

export const MARK_UNDERLINE = 'underline';

export interface UnderlinePluginOptions extends MarkPluginOptions {
  typeUnderline?: string;
}
