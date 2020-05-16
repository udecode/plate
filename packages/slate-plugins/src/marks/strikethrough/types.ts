import { MarkPluginOptions } from 'mark';

export const MARK_STRIKETHROUGH = 'strikethrough';

export interface StrikethroughPluginOptions extends MarkPluginOptions {
  typeStrikethrough?: string;
}
