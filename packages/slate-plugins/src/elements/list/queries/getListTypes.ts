import { SlatePluginsOptions } from '@udecode/slate-plugins-core';

export const getListTypes = ({ ul, ol }: SlatePluginsOptions) => {
  return [ol.type, ul.type];
};
