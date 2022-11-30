import { unsetCommentNodesById } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  usePlateEditorRef,
} from '@udecode/plate-core';
import { useCommentSelectors } from '../CommentProvider';

export type DeleteCommentButtonProps = {} & HTMLPropsAs<'div'>;

export const useDeleteCommentButton = (
  props: DeleteCommentButtonProps
): HTMLPropsAs<'div'> => {
  const id = useCommentSelectors().id();
  const editor = usePlateEditorRef();

  return {
    onClick: () => {
      unsetCommentNodesById(editor, { id });
    },
    ...props,
  };
};

export const DeleteCommentButton = createComponentAs<DeleteCommentButtonProps>(
  (props) => {
    const htmlProps = useDeleteCommentButton(props);
    return createElementAs('div', htmlProps);
  }
);
