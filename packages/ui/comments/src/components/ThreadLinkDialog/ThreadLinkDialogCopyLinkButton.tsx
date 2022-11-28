import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { getCommentUrl } from '../../utils/index';

export type ThreadLinkDialogCopyLinkRootProps = {
  commentId: string;
} & HTMLPropsAs<'div'>;

export const useThreadLinkDialogCopyLinkRoot = ({
  commentId,
  ...props
}: ThreadLinkDialogCopyLinkRootProps): HTMLPropsAs<'div'> => {
  return {
    onClick: () => {
      navigator.clipboard.writeText(getCommentUrl(commentId));
    },
    ...props,
  };
};

export const CommentLinkDialogCopyLinkRoot = createComponentAs<ThreadLinkDialogCopyLinkRootProps>(
  (props) => {
    const htmlProps = useThreadLinkDialogCopyLinkRoot(props);
    return createElementAs('div', htmlProps);
  }
);
