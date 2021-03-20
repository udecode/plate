import { getRenderElement } from '@udecode/slate-plugins-common';
import { options } from '../../../../../../stories/config/pluginOptions';
import { createEditorPlugins } from '../../../__fixtures__/editor.fixtures';
import { useAlignPlugin } from '../../../elements/align/useAlignPlugin';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = useAlignPlugin();
    delete plugin.deserialize;

    expect(
      serializeHTMLFromNodes(
        createEditorPlugins({
          plugins: [plugin],
        }),
        {
          plugins: [plugin],
          nodes: [
            {
              type: 'align_center',
              children: [{ text: 'I am centered text!' }],
            },
          ],
        }
      )
    ).toBe('<div>I am centered text!</div>');
  });
});
