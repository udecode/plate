import { ElementPluginOptions } from '@udecode/slate-plugins-common';

export const ELEMENT_LINK = 'a';

export const DEFAULTS_LINK: ElementPluginOptions = {
  nodeToProps: ({ element }) => ({ url: element.url }),
};
