import { TEmojiPickerState } from '@udecode/plate-emoji';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface EmojiPickerPreviewStyles {
  content?: CSSProp;
  emoji?: CSSProp;
  title?: CSSProp;
  subtitle?: CSSProp;
  text?: CSSProp;
}

export type EmojiPreviewProps = StyledProps<EmojiPickerPreviewStyles> &
  Pick<TEmojiPickerState, 'emoji'>;

export type EmojiPickerPreviewProps = StyledProps<EmojiPickerPreviewStyles> &
  Pick<TEmojiPickerState, 'emoji' | 'hasFound'>;

export interface EmojiPickerPreviewStyleProps
  extends StyledProps<EmojiPickerPreviewStyles> {}
