import { LinkElement } from './components/LinkElement';
import { LinkKeyOption, LinkPluginOptionsValues } from './types';

export const ELEMENT_LINK = 'a';

export const DEFAULTS_LINK: Record<
  LinkKeyOption,
  Required<LinkPluginOptionsValues>
> = {
  link: {
    component: LinkElement,
    type: ELEMENT_LINK,
    rootProps: {
      className: 'slate-link',
    },
  },
};
