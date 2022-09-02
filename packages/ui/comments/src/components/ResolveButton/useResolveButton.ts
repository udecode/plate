import { ResolveButtonProps } from './ResolveButton.types';

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
