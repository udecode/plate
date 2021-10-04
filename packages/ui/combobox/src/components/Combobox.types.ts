import {
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
} from '../combobox.store';
import { RenderFunction } from '../types/RenderFunction';

export interface ComboboxItemData {
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

  /**
   * Data available to `onRenderItem`.
   */
  data?: unknown;
}

export interface ComboboxItemProps {
  item: ComboboxItemData;
}

export interface ComboboxProps
  extends ComboboxStateById,
    Partial<Pick<ComboboxState, 'items'>> {
  /**
   * Render this component when the combobox is open (useful to inject hooks).
   */
  component?: RenderFunction<{ store: ComboboxStoreById }>;

  /**
   * Render combobox item.
   * @default text
   */
  onRenderItem?: RenderFunction<ComboboxItemProps>;
}
