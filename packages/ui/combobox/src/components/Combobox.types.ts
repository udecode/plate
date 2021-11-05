import { RenderFunction } from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import {
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
} from '../combobox.store';

export interface ComboboxStyleProps<TData> extends ComboboxProps<TData> {
  highlighted?: boolean;
}

export interface ComboboxStyles {
  item: CSSProp;
  highlightedItem: CSSProp;
}

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

export interface ComboboxItemProps<TData> {
  item: TComboboxItem<TData>;
}

export interface ComboboxProps<TData = NoData>
  extends Partial<Pick<ComboboxState<TData>, 'items'>>,
    ComboboxStateById<TData>,
    StyledProps<ComboboxStyles> {
  /**
   * Render this component when the combobox is open (useful to inject hooks).
   */
  component?: RenderFunction<{ store: ComboboxStoreById }>;

  /**
   * Render combobox item.
   * @default text
   */
  onRenderItem?: RenderFunction<ComboboxItemProps<TData>>;
}
