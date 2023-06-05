import { RenderFunction } from '@udecode/plate-common';
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
