import { Node } from '@core/index.js';

export const Document = Node.create({
  name: 'doc',

  topNode: true,

  content: 'block+',

  parseDOM() {
    return [{ tag: 'doc' }];
  },

  renderDOM() {
    return ['doc', 0];
  },

  addAttributes() {
    return {
      attributes: {
        rendered: false,
        'aria-label': 'Document node',
      },
    };
  },
});
