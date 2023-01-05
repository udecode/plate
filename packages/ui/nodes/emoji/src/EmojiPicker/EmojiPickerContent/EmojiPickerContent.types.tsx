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
    | 'onMouseOver'
    | 'onSelectEmoji'
    | 'emojiLibrary'
    | 'isSearching'
    | 'searchResult'
    | 'visibleCategories'
    | 'refs'
    | 'settings'
  >;

export interface EmojiPickerContentStyleProps
  extends StyledProps<EmojiPickerContentStyles> {}

export type ButtonProps = {
  index: number;
  emoji: Emoji;
  onSelect: (emoji: Emoji) => void;
  onMouseOver: (emoji?: Emoji) => void;
};

export type RowOfButtonsProps = Pick<
  UseEmojiPickerType,
  'onMouseOver' | 'onSelectEmoji' | 'emojiLibrary'
> & {
  row: GridRow;
};
