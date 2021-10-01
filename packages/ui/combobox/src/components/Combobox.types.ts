import {
  ComboboxState,
  ComboboxStateById,
  ComboboxStoreById,
} from '../combobox.store';
import { RenderFunction } from '../types/RenderFunction';

export interface ComboboxItemData {
  /**
   * Arbitrary string associated with this option.
   */
  key: string;

  /**
   * Text to render for this option
   */
  text: any;

  /**
   * Whether the option is disabled
   * @defaultvalue false
   */
  disabled?: boolean;

  /**
   * Data available to onRenderItem.
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
   */
  onRenderItem?: RenderFunction<ComboboxItemProps>;
  // data: Record<string, ComboboxDataProps>;
}
