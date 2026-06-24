import { createHyperscript } from '@platejs/plite-hyperscript';

export const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
});

globalThis.jsx = jsx;
