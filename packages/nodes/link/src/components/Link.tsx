import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  PlateRenderElementProps,
  useElementProps,
  Value,
} from '@udecode/plate-core';
import { TLinkElement } from '../types';

export type LinkRootProps = PlateRenderElementProps<Value, TLinkElement> &
  HTMLPropsAs<'a'>;

export const useLink = (props: LinkRootProps): HTMLPropsAs<'a'> => {
  const _props = useElementProps<TLinkElement, 'a'>({
    ...props,
    elementToAttributes: (element) => ({
      href: element.url,
      target: element.target,
    }),
  });

  return {
    ..._props,
    // quick fix: hovering <a> with href loses the editor focus
    onMouseOver: (e) => {
      e.stopPropagation();
    },
  };
};

export const LinkRoot = createComponentAs<LinkRootProps>((props) => {
  const htmlProps = useLink(props);

  return createElementAs('a', htmlProps);
});

export const Link = {
  Root: LinkRoot,
};
