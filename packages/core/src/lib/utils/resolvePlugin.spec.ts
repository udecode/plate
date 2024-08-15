import { createTEditor } from '@udecode/slate';

import { createPlugin } from '../plugin';
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
          .extendPlugin(
            { key: 'aa' },
            {
              type: 'ab',
            }
          )
          .extendPlugin(
            { key: 'aa' },
            {
              type: 'ac',
            }
          )
      ).plugins[0].type
    ).toBe('ac');
  });
});
