import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type LinkCommentButtonProps = {} & HTMLPropsAs<'div'>;

export const useLinkCommentButton = (
  props: LinkCommentButtonProps
): HTMLPropsAs<'div'> => {
  return { onClick: () => {}, ...props };
};

export const LinkCommentButton = createComponentAs<LinkCommentButtonProps>(
  (props) => {
    const htmlProps = useLinkCommentButton(props);
    return createElementAs('div', htmlProps);
  }
);
