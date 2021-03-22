import { SlatePluginOptions } from '@udecode/slate-plugins-core';

export const MARK_SUPERSCRIPT = 'superscript';

export const DEFAULTS_SUPERSCRIPT: Partial<SlatePluginOptions> = {
  hotkey: 'mod+,',
  clear: MARK_SUPERSCRIPT,
};
