import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCommentEditingCancelButtonProps = {
  onCancel?: (value: string) => void;
} & HTMLPropsAs<'button'>;

export const useThreadCommentEditingCancelButton = (
  props: ThreadCommentEditingCancelButtonProps
) => {
  const { onCancel, ...rest } = props;

  return { ...rest, onClick: onCancel };
};

export const ThreadCommentEditingCancelButton = createComponentAs<ThreadCommentEditingCancelButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentEditingCancelButton(props);
    return createElementAs('button', htmlProps);
  }
);
