import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ReOpenThreadButtonRootProps = {
  onReOpenThread: () => void;
} & HTMLPropsAs<'button'>;

export const useReOpenThreadButtonRoot = (
  props: ReOpenThreadButtonRootProps
): HTMLPropsAs<'button'> => {
  const { onReOpenThread } = props;

  return { ...props, onClick: onReOpenThread };
};

export const ReOpenThreadButtonRoot = createComponentAs<ReOpenThreadButtonRootProps>(
  (props) => {
    const htmlProps = useReOpenThreadButtonRoot(props);
    return createElementAs('button', htmlProps);
  }
);
