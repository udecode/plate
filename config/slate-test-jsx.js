import { createHyperscript } from '@platejs/slate-hyperscript';

export const jsx = createHyperscript({
  elements: {
    block: {},
    inline: { inline: true },
  },
});

globalThis.jsx = jsx;
