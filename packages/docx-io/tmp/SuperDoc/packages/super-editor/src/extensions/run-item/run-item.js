import { Node } from '@core/index.js';

export const RunItem = Node.create({
  name: 'run',

  group: 'inline',

  content: 'text*',

  inline: true,

  parseDOM() {
    return [{ tag: 'run' }];
  },

  renderDOM() {
    return ['run', 0];
  },

  addAttributes() {
    return {
      attributes: {
        rendered: false,
        'aria-label': 'Run node',
      },
    };
  },
});
