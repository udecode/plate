import { createTEditor } from '@udecode/slate';

import { createPlugin } from './createPlugin';
import { resolvePlugin } from './resolvePlugin';

describe('resolvePlugin', () => {
  it('should be', () => {
    expect(
      resolvePlugin(
        createTEditor() as any,
        createPlugin({
          key: 'a',
          plugins: [
            createPlugin({
              key: 'aa',
            }),
          ],
        })
          .extendPlugin('aa', {
            type: 'ab',
          })
          .extendPlugin('aa', {
            type: 'ac',
          })
      ).plugins[0].type
    ).toBe('ac');
  });
});
