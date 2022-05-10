import { createNodeIdPlugin } from '../../../editor/node-id/src/createNodeIdPlugin';
import { ELEMENT_H1 } from '../../../nodes/heading/src/constants';
import { createHeadingPlugin } from '../../../nodes/heading/src/createHeadingPlugin';
import { createParagraphPlugin } from '../../../nodes/paragraph/src/createParagraphPlugin';
import { withPlate } from '../plugins/withPlate';
import { Value } from '../slate/editor/TEditor';
import { createPlugins } from './createPlugins';
import { createTEditor } from './createTEditor';
import { getPlugin } from './getPlugin';

describe('createPlugins', () => {
  describe('when using components', () => {
    it('should merge component', () => {
      const plugins = createPlugins<Value>([createHeadingPlugin()], {
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
