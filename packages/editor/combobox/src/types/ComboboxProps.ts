import React from 'react';
import {
  ComboboxItemProps,
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
  NoData,
} from '..';

export interface ComboboxProps<TData = NoData>
  extends Partial<Pick<ComboboxState<TData>, 'items' | 'floatingOptions'>>,
    ComboboxStateById<TData> {
  /**
   * Render this component when the combobox is open (useful to inject hooks).
   */
  component?: React.FC<{ store: ComboboxStoreById }>;

  /**
   * Whether to hide the combobox.
   * @default !items.length
   */
  disabled?: boolean;

  /**
   * Render combobox item.
   * @default text
   */
  onRenderItem?: React.FC<ComboboxItemProps<TData>>;

  portalElement?: Element;
}
