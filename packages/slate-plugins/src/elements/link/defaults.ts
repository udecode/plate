import { isUrl } from '@udecode/slate-plugins-common';
import { LinkKeyOption, LinkPluginOptionsValues } from './types';

export const ELEMENT_LINK = 'a';
export const ATTRIBUTE_LINK = 'url';

export const DEFAULTS_LINK: Record<LinkKeyOption, LinkPluginOptionsValues> = {
  link: {
    // component: LinkElement,
    type: ELEMENT_LINK,
    attribute: ATTRIBUTE_LINK,
    isUrl,
    rootProps: {
      className: 'slate-link',
    },
  },
};
