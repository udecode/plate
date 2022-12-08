import { EmojiCategoryList, UseEmojiPickerType } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerNavigationStyles {
  // content?: CSSProp;
  // sticky?: CSSProp;
  // category?: CSSProp;
  button?: CSSProp;
  // buttonBg?: CSSProp;
}

export type EmojiPickerNavigationProps = StyledProps<EmojiPickerNavigationStyles> &
  Pick<UseEmojiPickerType, 'i18n' | 'emojiLibrary' | 'icons'> & {
    onClick: (id: EmojiCategoryList) => void;
  };

export interface EmojiPickerNavigationStyleProps
  extends StyledProps<EmojiPickerNavigationStyles> {}

// export type ButtonProps = {
//   index: number;
//   emoji: Emoji;
//   onClick: (emoji: Emoji) => void;
//   onMouseHandler: (emoji?: Emoji) => void;
// };
