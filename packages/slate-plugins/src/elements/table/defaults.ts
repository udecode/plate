import { ElementPluginOptions } from '@udecode/slate-plugins-common';

export const ELEMENT_TABLE = 'table';
export const ELEMENT_TH = 'th';
export const ELEMENT_TR = 'tr';
export const ELEMENT_TD = 'td';

export const KEYS_TABLE = [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD];

export const DEFAULTS_TH: ElementPluginOptions = {
  nodeToProps: ({ element }) => ({
    colSpan: element?.attributes?.colspan,
    rowSpan: element?.attributes?.rowspan,
  }),
};

export const DEFAULTS_TD: ElementPluginOptions = {
  nodeToProps: ({ element }) => ({
    colSpan: element?.attributes?.colspan,
    rowSpan: element?.attributes?.rowspan,
  }),
};
