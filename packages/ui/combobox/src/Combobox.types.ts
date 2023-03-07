import {
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
  NoData,
  TComboboxItem,
} from '@udecode/plate-combobox';
import { RenderFunction } from '@udecode/plate-common';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ComboboxStyleProps<TData> extends ComboboxProps<TData> {
  highlighted?: boolean;
}

export interface ComboboxStyles {
  item: CSSProp;
  highlightedItem: CSSProp;
}

export interface ComboboxItemProps<TData> {
  item: TComboboxItem<TData>;
  search: string;
}

export interface ComboboxProps<TData = NoData>
  extends Partial<Pick<ComboboxState<TData>, 'items' | 'floatingOptions'>>,
    ComboboxStateById<TData>,
    StyledProps<ComboboxStyles> {
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
