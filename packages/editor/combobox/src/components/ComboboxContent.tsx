import { Data, NoData } from '../types';
import { ComboboxProps } from '../types/ComboboxProps';
import { ComboboxContentItem } from './ComboboxContentItemProps';
import { ComboboxContentRoot } from './ComboboxContentRoot';

export type ComboboxContentProps<TData extends Data = NoData> = Omit<
  ComboboxProps<TData>,
  | 'id'
  | 'trigger'
  | 'searchPattern'
  | 'onSelectItem'
  | 'controlled'
  | 'maxSuggestions'
  | 'filter'
  | 'sort'
>;
export const ComboboxContent = {
  Root: ComboboxContentRoot,
  Item: ComboboxContentItem,
};
