import { PlatePlugin } from '@udecode/plate-common';

export const injectNodeIdClassName: PlatePlugin['inject'] = {
  props: {
    query: () => true,
    transformClassName: ({ element }) =>
      element ? idToClassName(element.id as string) : undefined,
  },
};

export const idToClassName = (id: string) => `slate-node-${id}`;
