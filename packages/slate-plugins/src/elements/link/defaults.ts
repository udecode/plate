import { isUrl } from '../../common/utils/isUrl';
import { LinkElement } from './components/LinkElement';
import { LinkKeyOption, LinkPluginOptionsValues } from './types';

export const ELEMENT_LINK = 'a';
export const ATTRIBUTE_LINK = 'url';

export const DEFAULTS_LINK: Record<LinkKeyOption, LinkPluginOptionsValues> = {
  link: {
    component: LinkElement,
    type: ELEMENT_LINK,
    attribute: ATTRIBUTE_LINK,
    isUrl,
    rootProps: {
      className: 'slate-link',
    },
  },
};
