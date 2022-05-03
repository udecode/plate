import { PlateEditor } from '@udecode/plate-core';
import { Value } from '../../../../core/src/slate/types/TEditor';

export interface TComboboxItemBase {
  /**
   * Unique key.
   */
  key: string;

  /**
   * Item text.
   */
  text: any;

  /**
   * Whether the item is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface TComboboxItemWithData<TData extends Data>
  extends TComboboxItemBase {
  /**
   * Data available to `onRenderItem`.
   */
  data: TData;
}

export type NoData = undefined;

export type Data = unknown;

export type TComboboxItem<TData = NoData> = TData extends NoData
  ? TComboboxItemBase
  : TComboboxItemWithData<TData>;

export type ComboboxOnSelectItem<V extends Value, TData> = (
  editor: PlateEditor<V>,
  item: TComboboxItem<TData>
) => any;
