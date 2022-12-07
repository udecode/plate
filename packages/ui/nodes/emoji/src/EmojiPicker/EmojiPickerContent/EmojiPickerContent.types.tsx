import { Emoji, TEmojiPickerState } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerContentStyles {
  content?: CSSProp;
  sticky?: CSSProp;
  category?: CSSProp;
  button?: CSSProp;
  buttonBg?: CSSProp;
}

export type EmojiPickerContentProps = StyledProps<EmojiPickerContentStyles> &
  Pick<
    TEmojiPickerState,
    | 'i18n'
    | 'setEmoji'
    | 'selectEmoji'
    | 'emojiLibrary'
    | 'isSearching'
    | 'searchResult'
  >;

export interface EmojiPickerContentStyleProps
  extends StyledProps<EmojiPickerContentStyles> {}

export type ButtonProps = {
  index: number;
  emoji: Emoji;
  onClick: (emoji: Emoji) => void;
  onMouseHandler: (emoji?: Emoji) => void;
};
