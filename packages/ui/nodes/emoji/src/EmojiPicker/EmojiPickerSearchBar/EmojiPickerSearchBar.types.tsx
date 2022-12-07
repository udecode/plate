import { TEmojiPickerState } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerSearchBarStyles {
  input?: CSSProp;
  loupeIcon?: CSSProp;
  button?: CSSProp;
}

export type EmojiPickerSearchBarProps = StyledProps<EmojiPickerSearchBarStyles> &
  Pick<TEmojiPickerState, 'i18n' | 'searchValue' | 'setSearch' | 'clearSearch'>;

export interface EmojiPickerSearchBarStyleProps
  extends StyledProps<EmojiPickerSearchBarStyles> {}
