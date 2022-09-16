import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCancelButtonProps = {
  onCancel?: () => void;
  hideThread?: () => void;
} & HTMLPropsAs<'button'>;

export const useThreadCancelButton = (props: ThreadCancelButtonProps) => {
  const { onCancel, hideThread, ...rest } = props;

  const onClick = useCallback(() => {
    onCancel?.();
    hideThread?.();
  }, [hideThread, onCancel]);

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
