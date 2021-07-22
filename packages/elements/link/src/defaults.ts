import { PlatePluginOptions } from '@udecode/plate-core';

export const ELEMENT_LINK = 'a';

export const DEFAULTS_LINK: Partial<PlatePluginOptions> = {
  getNodeProps: ({ element }) => ({ url: element?.url }),
};
