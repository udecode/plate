import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for inline footnote combobox inputs. */
export const BaseFootnoteInputPlugin = createBasePlugin({
  key: KEYS.footnoteInput,
  editOnly: true,
  schema: {
    element: {
      properties: {
        trigger: property.string(),
        userId: property.string(),
        value: property.string(),
      },
      void: 'inline',
    },
  },
});
