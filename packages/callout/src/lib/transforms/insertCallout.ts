import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
} from '@platejs/plite';
import type { TCalloutElement } from '@platejs/utils';

export const CALLOUT_STORAGE_KEY = 'plate-storage-callout';

export type InsertCalloutOptions = NodeInsertNodesOptions<TCalloutElement> & {
  icon?: string;
  variant?: TCalloutElement['variant'];
};

export const insertCallout = (
  tx: EditorUpdateTransaction,
  type: string,
  { icon, variant, ...options }: InsertCalloutOptions = {}
) => {
  tx.nodes.insert<TCalloutElement>(
    {
      children: [{ text: '' }],
      icon: icon ?? localStorage.getItem(CALLOUT_STORAGE_KEY) ?? '💡',
      type,
      ...(variant === undefined ? {} : { variant }),
    },
    options
  );
};
