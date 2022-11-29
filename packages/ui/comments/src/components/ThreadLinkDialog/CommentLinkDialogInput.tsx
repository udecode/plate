import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { getCommentUrl } from '../../utils/index';
import { useCommentSelectors } from '../CommentProvider';

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

export const CommentLinkDialogInput = createComponentAs<CommentLinkDialogInputProps>(
  (props) => {
    const htmlProps = useCommentLinkDialogInput(props);
    return createElementAs('input', htmlProps);
  }
);
