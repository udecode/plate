import { createEditor } from 'slate';
import { mergeDeepPlugins } from './mergeDeepPlugins';

describe('mergeDeepPlugins', () => {
  it('should be', () => {
    expect(
      mergeDeepPlugins(createEditor() as any, {
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
    ).toEqual({
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
    });
  });
});
