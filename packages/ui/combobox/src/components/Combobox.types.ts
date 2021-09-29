import { ComboboxStateById } from '../combobox.store';
import { RenderFunction } from '../types/RenderFunction';

export enum ComboboxItemType {
  Normal = 0,
  Divider = 1,
  Header = 2,
}

export interface IComboboxItem {
  /**
   * Arbitrary string associated with this option.
   */
  key: string;

  /**
   * Text to render for this option
   */
  text: any;

  /**
   * Text to render for this option
   */
  itemType?: ComboboxItemType;

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
  item: IComboboxItem;
}

export interface ComboboxProps extends ComboboxStateById {
  id: string;
  component?: any;
  onRenderItem?: RenderFunction<ComboboxItemProps>;
  // data: Record<string, ComboboxDataProps>;
}
