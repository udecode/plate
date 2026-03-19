import * as nodeEntriesModule from './getSuggestionNodeEntries';
import * as keysModule from './getSuggestionKeys';
import { getActiveSuggestionDescriptions } from './getActiveSuggestionDescriptions';

describe('getActiveSuggestionDescriptions', () => {
  it('builds replacement and insertion descriptions per user', () => {
    const userIdsSpy = spyOn(
      keysModule,
      'getSuggestionUserIds'
    ).mockReturnValue(['user-a', 'user-b']);
    const nodeEntriesSpy = spyOn(
      nodeEntriesModule,
      'getSuggestionNodeEntries'
    ).mockImplementation(((
      _editor: any,
      _suggestionId: string,
      options: any
    ) => {
      if (options?.match({ 'suggestion_user-a': true })) {
        return (function* () {
          yield [{ suggestionDeletion: true, text: 'old' }, [0]];
          yield [{ suggestionDeletion: false, text: 'new' }, [1]];
        })();
      }

      return (function* () {
        yield [{ suggestionDeletion: false, text: 'fresh' }, [2]];
      })();
    }) as any);
    const editor = {
      getApi: () => ({
        suggestion: {
          node: () =>
            [
              [{ 'suggestion_user-a': true, 'suggestion_user-b': true }, [0]],
            ] as any,
          nodeId: () => 'suggestion-1',
        },
      }),
    } as any;

    expect(getActiveSuggestionDescriptions(editor)).toEqual([
      {
        deletedText: 'old',
        insertedText: 'new',
        suggestionId: 'suggestion-1',
        type: 'replacement',
        userId: 'user-a',
      },
      {
        insertedText: 'fresh',
        suggestionId: 'suggestion-1',
        type: 'insertion',
        userId: 'user-b',
      },
    ]);

    userIdsSpy.mockRestore();
    nodeEntriesSpy.mockRestore();
  });

  it('returns an empty array when there is no active suggestion node', () => {
    const editor = {
      getApi: () => ({
        suggestion: {
          node: () => null,
        },
      }),
    } as any;

    expect(getActiveSuggestionDescriptions(editor)).toEqual([]);
  });
});
