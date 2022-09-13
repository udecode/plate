import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCancelButtonProps = {
  onCancel?: () => void;
} & HTMLPropsAs<'button'>;

export const useThreadCancelButton = (props: ThreadCancelButtonProps) => {
  const { onCancel, ...rest } = props;

  const onClick = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return {
    ...rest,
    onClick,
  };
};

export const ThreadCancelButton = createComponentAs<ThreadCancelButtonProps>(
  (props) => {
    const htmlProps = useThreadCancelButton(props);
    return createElementAs('button', htmlProps);
  }
);
