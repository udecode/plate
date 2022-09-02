import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { OnReOpenThread } from '../../types';

export interface ReOpenThreadButtonStyleProps extends ReOpenThreadButtonProps {}

export interface ReOpenThreadButtonStyles {
  icon: CSSProp;
}

export interface ReOpenThreadButtonProps
  extends StyledProps<ReOpenThreadButtonStyles> {
  onReOpenThread: OnReOpenThread;
}
