import { MarkPluginOptions } from 'mark';

export const MARK_SUPERSCRIPT = 'SUPERSCRIPT';

export interface SuperscriptPluginOptions extends MarkPluginOptions {
  typeSuperscript?: string;
  typeSubscript?: string;
}
