import { UseEmojiPickerType } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerSearchAndClearStyles {
  loupeIcon?: CSSProp;
  clearIcon?: CSSProp;
}

export type EmojiPickerSearchAndClearProps = StyledProps<EmojiPickerSearchAndClearStyles> &
  Pick<UseEmojiPickerType, 'i18n' | 'searchValue' | 'clearSearch'>;

export interface EmojiPickerSearchAndClearStyleProps
  extends StyledProps<EmojiPickerSearchAndClearStyles> {}
