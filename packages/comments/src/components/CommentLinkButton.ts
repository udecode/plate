import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';

export type CommentLinkButtonProps = {} & HTMLPropsAs<'div'>;

export const useCommentLinkButton = (
  props: CommentLinkButtonProps
): HTMLPropsAs<'div'> => {
  return { onClick: () => {}, ...props };
};

export const CommentLinkButton = createComponentAs<CommentLinkButtonProps>(
  (props) => {
    const htmlProps = useCommentLinkButton(props);
    return createElementAs('div', htmlProps);
  }
);
