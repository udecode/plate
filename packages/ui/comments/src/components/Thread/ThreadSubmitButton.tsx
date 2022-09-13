import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { Thread, User } from '../../utils';

export type ThreadSubmitButtonProps = {
  onSubmitComment?: (value: string, assignedTo: User) => void;
  value: string;
  thread: Thread;
} & HTMLPropsAs<'button'>;

export const useThreadSubmitButton = (props: ThreadSubmitButtonProps) => {
  const { onSubmitComment, thread, value, ...rest } = props;

  const onClick = useCallback(() => {
    if (thread.assignedTo) {
      onSubmitComment?.(value, thread.assignedTo);
    }
  }, [thread.assignedTo, onSubmitComment, value]);

  return {
    ...rest,
    onClick,
    disabled: value.trim().length === 0,
  };
};

export const ThreadSubmitButton = createComponentAs<ThreadSubmitButtonProps>(
  (props) => {
    const htmlProps = useThreadSubmitButton(props);
    return createElementAs('button', htmlProps);
  }
);
