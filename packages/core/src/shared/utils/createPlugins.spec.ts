import { ELEMENT_H1, HeadingPlugin } from '@udecode/plate-heading';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { createTEditor } from '@udecode/slate';

import { withPlate } from '../../client';
import { createPlugins } from './createPlugins';
import { getPlugin } from './getPlugin';

describe('createPlugins', () => {
  describe('when using components', () => {
    it('should merge component', () => {
      const plugins = createPlugins([HeadingPlugin], {
        components: {
          [ELEMENT_H1]: () => null,
        },
      });
      console.log(plugins);

      const editor = withPlate(createTEditor(), { id: '1', plugins });

      console.log(getPlugin(editor, ELEMENT_H1));

      expect(getPlugin(editor, ELEMENT_H1).component).toBeDefined();
    });
  });

  describe('when typed plugin', () => {
    it('should run', () => {
      const plugins = createPlugins([ParagraphPlugin, NodeIdPlugin]);

      expect(plugins).toBeDefined();
    });
  });
});
