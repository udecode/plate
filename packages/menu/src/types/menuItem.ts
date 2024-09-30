import type { Ariakit } from '../lib';

export interface MenuItemProps
  extends Omit<Ariakit.ComboboxItemProps, 'store'> {
  group?: string;
  icon?: React.ReactNode;
  label?: string;
  name?: string;
  parentGroup?: string;
  preventClose?: boolean;
  shortcut?: string;
  value?: string;
}
