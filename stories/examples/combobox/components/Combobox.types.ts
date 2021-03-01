import { ReactEditor } from 'slate-react';

export interface RenderFunction<P = { [key: string]: any }> {
  (
    props: P,
    defaultRender?: (props?: P) => JSX.Element | null
  ): JSX.Element | null;
}

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

export interface ComboboxProps {
  onSelectItem: (editor: ReactEditor, item: IComboboxItem) => void;
  onRenderItem?: RenderFunction<ComboboxItemProps>;
}
