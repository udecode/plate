import type { NodeInsertNodesOptions, TCalloutElement } from 'platejs';

export const CALLOUT_STORAGE_KEY = 'plate-storage-callout';

export type InsertCalloutOptions = NodeInsertNodesOptions<TCalloutElement> & {
  icon?: string;
  variant?: (string & {}) | TCalloutElement['variant'];
};

export const createCalloutNode = (
  type: string,
  { icon, variant }: Pick<InsertCalloutOptions, 'icon' | 'variant'> = {}
): TCalloutElement => ({
  children: [{ text: '' }],
  icon: icon ?? localStorage.getItem(CALLOUT_STORAGE_KEY) ?? '💡',
  type,
  variant,
});
