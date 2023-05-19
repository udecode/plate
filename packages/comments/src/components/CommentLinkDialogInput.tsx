import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';
import { useCommentSelectors } from '../stores/comment/CommentProvider';
import { getCommentUrl } from '../utils/getCommentUrl';

export type CommentLinkDialogInputProps = {} & HTMLPropsAs<'input'>;

export const useCommentLinkDialogInput = ({
  ...props
}: CommentLinkDialogInputProps): HTMLPropsAs<'input'> => {
  return {
    defaultValue: getCommentUrl(useCommentSelectors().id()),
    readOnly: true,
    ...props,
  };
};

export const CommentLinkDialogInput =
  createComponentAs<CommentLinkDialogInputProps>((props) => {
    const htmlProps = useCommentLinkDialogInput(props);
    return createElementAs('input', htmlProps);
  });
