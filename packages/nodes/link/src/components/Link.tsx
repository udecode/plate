import { createPlateElementComponent } from '@udecode/plate-core';
import { TLinkElement } from '../types';

export const LinkRoot = createPlateElementComponent<TLinkElement, 'a'>({
  as: 'a',
  elementToAttributes: (element) => ({
    href: element.url,
  }),
});

export const Link = {
  Root: LinkRoot,
};
