import { RenderFunction } from '@udecode/plate-core';
import {
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
} from '../combobox.store';
import { NoData, TComboboxItem } from './ComboboxOnSelectItem';

export interface ComboboxItemProps<TData> {
  item: TComboboxItem<TData>;
  search: string;
}

export interface ComboboxProps<TData = NoData>
  extends Partial<Pick<ComboboxState<TData>, 'items' | 'floatingOptions'>>,
    ComboboxStateById<TData> {
  /**
   * Render this component when the combobox is open (useful to inject hooks).
   */
  component?: RenderFunction<{ store: ComboboxStoreById }>;

  /**
   * Whether to hide the combobox.
   * @default !items.length
   */
  disabled?: boolean;

  /**
   * Render combobox item.
   * @default text
   */
  onRenderItem?: RenderFunction<ComboboxItemProps<TData>>;

  portalElement?: Element;
}
