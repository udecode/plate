import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { ComboboxState, ComboboxStoreById } from '../combobox.store';
import { RenderFunction } from '../types/RenderFunction';

export interface ComboboxStyleProps extends ComboboxProps {
  highlighted?: boolean;
}

export interface ComboboxStyles {
  item: CSSProp;
  highlightedItem: CSSProp;
}

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
  extends Partial<Pick<ComboboxState, 'items'>>,
    StyledProps<ComboboxStyles> {
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
