import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ReOpenThreadButtonRootProps = {
  onReOpenThread: () => void;
} & HTMLPropsAs<'div'>;

export const useReOpenThreadButtonRoot = (
  props: ReOpenThreadButtonRootProps
): HTMLPropsAs<'div'> => {
  const { onReOpenThread } = props;

  return { ...props, onClick: onReOpenThread };
};

export const ReOpenThreadButtonRoot = createComponentAs<ReOpenThreadButtonRootProps>(
  (props) => {
    const htmlProps = useReOpenThreadButtonRoot(props);
    return createElementAs('div', htmlProps);
  }
);
