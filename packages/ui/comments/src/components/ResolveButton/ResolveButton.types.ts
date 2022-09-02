import { Thread } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { OnResolveThread } from '../../types';

export interface ResolveButtonStyleProps extends ResolveButtonProps {}

export interface ResolveButtonStyles {
  icon: CSSProp;
}

export interface ResolveButtonProps extends StyledProps<ResolveButtonStyles> {
  thread: Thread;
  onResolveThread: OnResolveThread;
}
