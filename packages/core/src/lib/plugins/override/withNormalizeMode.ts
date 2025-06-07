import type { OverrideEditor } from '../../plugin/SlatePlugin';

export const withNormalizeMode: OverrideEditor = (ctx) => {
  const { editor } = ctx;

  return {
    transforms: {
      normalizeNode(node, path) {
        // TODO
      },
    },
  };
};
