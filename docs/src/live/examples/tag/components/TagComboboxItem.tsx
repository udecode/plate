import * as React from 'react';
import { ComboboxItemProps } from '../../combobox/components/Combobox.types';

export type ITagComboboxItemData =
  | {
      isNew?: boolean;
    }
  | undefined;

export const TagComboboxItem = ({ item }: ComboboxItemProps) => {
  return !(item.data as ITagComboboxItemData)?.isNew ? (
    item.text
  ) : (
    <div className="inline-flex items-center">
      New "<span className="font-medium">{item.text}</span>" tag
    </div>
  );
};
