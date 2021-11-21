import { createEditor } from 'slate';
import { createNodeIdPlugin } from '../../../editor/node-id/src/createNodeIdPlugin';
import { ELEMENT_H1 } from '../../../elements/heading/src/constants';
import { createHeadingPlugin } from '../../../elements/heading/src/createHeadingPlugin';
import { createParagraphPlugin } from '../../../elements/paragraph/src/createParagraphPlugin';
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

      const editor = withPlate(createEditor(), { id: '1', plugins });

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
