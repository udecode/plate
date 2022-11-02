import { Thread } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ResolveButtonRootProps = {
  thread: Thread;
  onResolveThread: () => void;
} & HTMLPropsAs<'div'>;

export const useResolveButtonRoot = (
  props: ResolveButtonRootProps
): HTMLPropsAs<'div'> => {
  const { thread, onResolveThread } = props;

  const title = `Mark as ${
    thread.assignedTo ? 'done' : 'resolved'
  } and hide discussion`;

  return { ...props, onClick: onResolveThread, title };
};

export const ResolveButtonRoot = createComponentAs<ResolveButtonRootProps>(
  (props) => {
    const htmlProps = useResolveButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
