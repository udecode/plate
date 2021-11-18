import { createEditor } from 'slate';
import { mergeDeepPlugins } from './mergeDeepPlugins';
import { mockPlugin } from './mockPlugin';

describe('mergeDeepPlugins', () => {
  it('should be', () => {
    expect(
      mergeDeepPlugins(
        createEditor() as any,
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
