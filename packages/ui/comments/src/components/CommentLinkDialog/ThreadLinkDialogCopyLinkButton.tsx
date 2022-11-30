import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { getCommentUrl } from '../../utils/index';
import { useCommentSelectors } from '../CommentProvider';

export type CommentLinkDialogCopyLinkProps = {} & HTMLPropsAs<'div'>;

export const useCommentLinkDialogCopyLink = ({
  ...props
}: CommentLinkDialogCopyLinkProps): HTMLPropsAs<'div'> => {
  const id = useCommentSelectors().id();

  return {
    onClick: () => {
      navigator.clipboard.writeText(getCommentUrl(id));
    },
    ...props,
  };
};

export const CommentLinkDialogCopyLink = createComponentAs<CommentLinkDialogCopyLinkProps>(
  (props) => {
    const htmlProps = useCommentLinkDialogCopyLink(props);
    return createElementAs('div', htmlProps);
  }
);
