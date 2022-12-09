import { UseEmojiPickerType } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerPreviewStyles {
  content?: CSSProp;
  emoji?: CSSProp;
  title?: CSSProp;
  subtitle?: CSSProp;
  text?: CSSProp;
}

export type EmojiPickerPreviewProps = StyledProps<EmojiPickerPreviewStyles> &
  Pick<UseEmojiPickerType, 'emoji' | 'hasFound' | 'isSearching' | 'i18n'>;

export type EmojiPreviewProps = StyledProps<EmojiPickerPreviewStyles> &
  Pick<UseEmojiPickerType, 'emoji'>;

export type NoEmojiPreviewProps = StyledProps<EmojiPickerPreviewStyles> &
  Pick<UseEmojiPickerType, 'i18n'>;
export type PickAnEmojiPreviewProps = NoEmojiPreviewProps;

export interface EmojiPickerPreviewStyleProps
  extends StyledProps<EmojiPickerPreviewStyles> {}
