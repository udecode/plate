import { createAlignPlugin } from '../../../../../elements/alignment/src/createAlignPlugin';
import { createEditorPlugins } from '../../../../../slate-plugins/src/utils/createEditorPlugins';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';

describe('when there is no deserializer', () => {
  it('not serialize', () => {
    const plugin = createAlignPlugin();
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
