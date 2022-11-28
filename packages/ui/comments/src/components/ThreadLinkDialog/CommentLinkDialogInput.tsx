import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { getCommentUrl } from '../../utils/index';

export type CommentLinkDialogInputProps = {
  commentId: string;
} & HTMLPropsAs<'input'>;

export const useCommentLinkDialogInput = ({
  commentId,
  ...props
}: CommentLinkDialogInputProps): HTMLPropsAs<'input'> => {
  return { defaultValue: getCommentUrl(commentId), readOnly: true, ...props };
};

export const CommentLinkDialogInput = createComponentAs<CommentLinkDialogInputProps>(
  (props) => {
    const htmlProps = useCommentLinkDialogInput(props);
    return createElementAs('input', htmlProps);
  }
);
