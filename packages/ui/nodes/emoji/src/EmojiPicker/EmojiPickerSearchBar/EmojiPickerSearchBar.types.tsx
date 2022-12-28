import { ReactNode } from 'react';
import { UseEmojiPickerType } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerSearchBarStyles {
  input?: CSSProp;
}

export type EmojiPickerSearchBarProps = {
  children: ReactNode;
} & StyledProps<EmojiPickerSearchBarStyles> &
  Pick<UseEmojiPickerType, 'i18n' | 'searchValue' | 'setSearch'>;

export interface EmojiPickerSearchBarStyleProps
  extends StyledProps<EmojiPickerSearchBarStyles> {}
