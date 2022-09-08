import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { Thread } from '../utils';

export type ResolveButtonStyleProps = ResolveButtonProps;

export type ResolveButtonStyles = {
  icon: CSSProp;
};

export type ResolveButtonProps = {
  thread: Thread;
  onResolveThread: () => void;
} & StyledProps<ResolveButtonStyles>;

export const useResolveButton = (props: ResolveButtonProps) => {
  const { thread, onResolveThread } = props;
  const title = `Mark as ${
    thread.assignedTo ? 'done' : 'resolved'
  } and hide discussion`;

  return {
    onResolveThread,
    title,
  } as const;
};
