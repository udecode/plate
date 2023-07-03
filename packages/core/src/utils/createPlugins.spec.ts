import { withPlate } from '@/packages/core/src/plugins/withPlate';
import { ELEMENT_H1, createHeadingPlugin } from '@udecode/plate-heading';
import { createNodeIdPlugin } from '@udecode/plate-node-id';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createTEditor } from '@udecode/slate/src/createTEditor';

import { createPlugins } from './createPlugins';
import { getPlugin } from './getPlugin';

describe('createPlugins', () => {
  describe('when using components', () => {
    it('should merge component', () => {
      const plugins = createPlugins([createHeadingPlugin()], {
        components: {
          [ELEMENT_H1]: () => null,
        },
      });

      const editor = withPlate(createTEditor(), { id: '1', plugins });

      expect(getPlugin(editor, ELEMENT_H1).component).toBeDefined();
    });
  });

  describe('when typed plugin', () => {
    it('should run', () => {
      const plugins = createPlugins([
        createParagraphPlugin(),
        createNodeIdPlugin(),
      ]);

      expect(plugins).toBeDefined();
    });
  });
});
