import type { InsertNodesOptions, SlateEditor, TCalloutElement } from 'platejs';

import { KEYS } from 'platejs';

export const CALLOUT_STORAGE_KEY = 'plate-storage-callout';

export const insertCallout = (
  editor: SlateEditor,
  {
    icon,
    variant,
    ...options
  }: InsertNodesOptions & {
    icon?: string;
    variant?: (string & {}) | TCalloutElement['variant'];
  } = {}
) => {
  editor.tf.insertNodes<TCalloutElement>(
    {
      children: [{ text: '' }],
      icon: icon ?? localStorage.getItem(CALLOUT_STORAGE_KEY) ?? '💡',
      type: editor.getType(KEYS.callout),
      variant,
    },
    options as any
  );
};
