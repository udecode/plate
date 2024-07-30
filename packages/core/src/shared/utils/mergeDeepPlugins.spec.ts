import { createTEditor } from '@udecode/slate';

import { mockPlugin } from './mockPlugin';
import { resolvePlugin } from './resolvePlugin';

describe('mergeDeepPlugins', () => {
  it('should be', () => {
    expect(
      resolvePlugin(
        createTEditor() as any,
        mockPlugin({
          key: 'a',
          plugins: [
            {
              key: 'aa',
            },
            {
              key: 'ab',
            },
          ],
          then: () => ({
            plugins: [
              {
                key: 'bb',
              },
              {
                key: 'ab',
                type: 'test',
              },
            ],
            then: () => ({
              plugins: [
                {
                  key: 'cc',
                },
              ],
            }),
          }),
        })
      )
    ).toEqual(
      mockPlugin({
        key: 'a',
        plugins: [
          {
            key: 'aa',
          },
          {
            key: 'ab',
            type: 'test',
          },
          {
            key: 'bb',
          },
          {
            key: 'cc',
          },
        ],
      })
    );
  });
});
