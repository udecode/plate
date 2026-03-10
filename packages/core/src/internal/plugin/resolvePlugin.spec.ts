import { createSlateEditor } from '../../lib/editor';
import { createSlatePlugin } from '../../lib/plugin';

describe('resolvePlugin', () => {
  it('lets the last child-plugin extension win', () => {
    expect(
      createSlateEditor({
        plugins: [
          createSlatePlugin({
            key: 'a',
            plugins: [
              createSlatePlugin({
                key: 'aa',
              }),
            ],
          })
            .extendPlugin(
              { key: 'aa' },
              {
                node: { type: 'ab' },
              }
            )
            .extendPlugin(
              { key: 'aa' },
              {
                node: { type: 'ac' },
              }
            ),
        ],
      }).plugins.aa.node.type
    ).toBe('ac');
  });
});
