import { MarkPluginOptions } from '@udecode/slate-plugins-common';

export const MARK_SUPERSCRIPT = 'superscript';
export const MARK_SUBSCRIPT = 'subscript';

export const DEFAULTS_SUPERSCRIPT: MarkPluginOptions = {
  hotkey: 'mod+,',
  clear: MARK_SUPERSCRIPT,
};

export const DEFAULTS_SUBSCRIPT: MarkPluginOptions = {
  hotkey: 'mod+.',
  clear: MARK_SUBSCRIPT,
};
