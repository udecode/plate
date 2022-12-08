import { Emoji, GridRow, UseEmojiPickerType } from '@udecode/plate-emoji';
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
    UseEmojiPickerType,
    | 'i18n'
    | 'setEmoji'
    | 'selectEmoji'
    | 'emojiLibrary'
    | 'isSearching'
    | 'searchResult'
    | 'scrollRef'
  >;

export interface EmojiPickerContentStyleProps
  extends StyledProps<EmojiPickerContentStyles> {}

export type ButtonProps = {
  index: number;
  emoji: Emoji;
  onClick: (emoji: Emoji) => void;
  onMouseHandler: (emoji?: Emoji) => void;
};

export type RowOfButtonsProps = Pick<
  UseEmojiPickerType,
  'setEmoji' | 'selectEmoji' | 'emojiLibrary'
> & {
  row: GridRow;
};
