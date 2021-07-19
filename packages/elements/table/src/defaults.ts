import { PlatePluginOptions } from '@udecode/plate-core';

export const ELEMENT_TABLE = 'table';
export const ELEMENT_TH = 'th';
export const ELEMENT_TR = 'tr';
export const ELEMENT_TD = 'td';

export const KEYS_TABLE = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];

export const DEFAULTS_TH: Partial<PlatePluginOptions> = {
  getNodeProps: ({ element }) => ({
    colSpan: element?.attributes?.colspan,
    rowSpan: element?.attributes?.rowspan,
  }),
};

export const DEFAULTS_TD: Partial<PlatePluginOptions> = {
  getNodeProps: ({ element }) => ({
    colSpan: element?.attributes?.colspan,
    rowSpan: element?.attributes?.rowspan,
  }),
};
