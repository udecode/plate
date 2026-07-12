import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for inline footnote combobox inputs. */
export const BaseFootnoteInputPlugin = createBasePlugin({
  key: KEYS.footnoteInput,
  editOnly: true,
  node: { isElement: true, isInline: true, isVoid: true },
});
