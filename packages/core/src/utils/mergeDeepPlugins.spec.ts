import { createTEditor } from '@udecode/slate/src/createTEditor';
import { mergeDeepPlugins } from './mergeDeepPlugins';
import { mockPlugin } from './mockPlugin';

describe('mergeDeepPlugins', () => {
  it('should be', () => {
    expect(
      mergeDeepPlugins(
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
