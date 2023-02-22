import { ComboboxProps, NoData } from '@udecode/plate-combobox';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface ComboboxStyleProps<TData> extends PlateComboboxProps<TData> {
  highlighted?: boolean;
}

export interface ComboboxStyles {
  item: CSSProp;
  highlightedItem: CSSProp;
}

export interface PlateComboboxProps<TData = NoData>
  extends ComboboxProps<TData>,
    StyledProps<ComboboxStyles> {}
