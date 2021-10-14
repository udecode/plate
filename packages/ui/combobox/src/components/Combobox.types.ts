import { RenderFunction } from '@udecode/plate-common';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import {
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
} from '../combobox.store';

export interface ComboboxStyleProps<TItemData>
  extends ComboboxProps<TItemData> {
  highlighted?: boolean;
}

export interface ComboboxStyles {
  item: CSSProp;
  highlightedItem: CSSProp;
}

export interface ComboboxItemDataBase {
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

export interface ComboboxItemDataWithData<TItemData extends ItemData>
  extends ComboboxItemDataBase {
  /**
   * Data available to `onRenderItem`.
   */
  data: TItemData;
}

export type NoItemData = undefined;

export type ItemData = unknown;

export type ComboboxItemData<TItemData> = TItemData extends NoItemData
  ? ComboboxItemDataBase
  : ComboboxItemDataWithData<TItemData>;

export interface ComboboxItemProps<TItemData> {
  item: ComboboxItemData<TItemData>;
}

export interface ComboboxProps<TItemData = NoItemData>
  extends Partial<Pick<ComboboxState<TItemData>, 'items'>>,
    ComboboxStateById<TItemData>,
    StyledProps<ComboboxStyles> {
  /**
   * Render this component when the combobox is open (useful to inject hooks).
   */
  component?: RenderFunction<{ store: ComboboxStoreById }>;

  /**
   * Render combobox item.
   * @default text
   */
  onRenderItem?: RenderFunction<ComboboxItemProps<TItemData>>;
}
