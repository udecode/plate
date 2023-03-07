import { ELEMENT_H1 } from 'packages/nodes/heading/src/constants';
import { createHeadingPlugin } from 'packages/nodes/heading/src/createHeadingPlugin';
import { createNodeIdPlugin } from 'packages/editor/node-id/src/createNodeIdPlugin';
import { createParagraphPlugin } from 'packages/nodes/paragraph/src/createParagraphPlugin';
import { createTEditor } from '../../../slate/src/createTEditor';
import { withPlate } from '../plugins/withPlate';
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
