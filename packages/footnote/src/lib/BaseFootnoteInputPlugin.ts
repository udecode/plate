import { createSlatePlugin, KEYS } from 'platejs';

/** Enables support for inline footnote combobox inputs. */
export const BaseFootnoteInputPlugin = createSlatePlugin({
  key: KEYS.footnoteInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});
