import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ReOpenThreadRootProps = {
  onReOpenThread: () => void;
} & HTMLPropsAs<'button'>;

export const useReOpenThreadRoot = (props: ReOpenThreadRootProps) => {
  const { onReOpenThread } = props;

  return {
    ...props,
    onClick: onReOpenThread,
    title: 'Re-open',
    type: 'button',
  } as const;
};

export const ReOpenThreadRoot = createComponentAs<ReOpenThreadRootProps>(
  (props) => {
    const htmlProps = useReOpenThreadRoot(props);
    return createElementAs('button', htmlProps);
  }
);
