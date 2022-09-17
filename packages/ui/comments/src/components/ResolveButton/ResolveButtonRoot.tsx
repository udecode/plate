import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { Thread } from '../../types';

export type ResolveButtonRootProps = {
  thread: Thread;
  onResolveThread: () => void;
} & HTMLPropsAs<'button'>;

export const useResolveButtonRoot = (
  props: ResolveButtonRootProps
): HTMLPropsAs<'button'> => {
  const { thread, onResolveThread } = props;

  const title = `Mark as ${
    thread.assignedTo ? 'done' : 'resolved'
  } and hide discussion`;

  return { ...props, onClick: onResolveThread, title };
};

export const ResolveButtonRoot = createComponentAs<ResolveButtonRootProps>(
  (props) => {
    const htmlProps = useResolveButtonRoot(props);
    return createElementAs('button', htmlProps);
  }
);
