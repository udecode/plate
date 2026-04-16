import { KEYS } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { deleteSuggestion } from './deleteSuggestion';

const createSuggestionNode = ({
  createdAt = 1,
  id = 's1',
  text = '',
  type = 'insert',
  userId = 'alice',
}: {
  createdAt?: number;
  id?: string;
  text?: string;
  type?: 'insert' | 'remove';
  userId?: string;
} = {}) => ({
  [KEYS.suggestion]: true,
  [`${KEYS.suggestion}_${id}`]: { createdAt, id, type, userId },
  text,
});

describe('deleteSuggestion', () => {
  it('removes empty inserted block suggestions instead of converting them to remove suggestions', () => {
    const pointCurrent = { offset: 0, path: [0, 0] };
    const pointTarget = { offset: 1, path: [0, 0] };
    const suggestionNode = createSuggestionNode();
    const removeNodes = mock(() => {
      editor.selection = undefined;
    });

    const editor = {
      api: {
        above: () => {},
        after: () => pointTarget,
        isEnd: () => false,
        isAt: () => false,
        isEmpty: () => true,
        isStart: () => true,
        node: () => [suggestionNode, [0, 0]],
        pointRef: () => ({ current: pointTarget }),
        range: (path: number[]) => ({
          anchor: { offset: 0, path },
          focus: { offset: 1, path },
        }),
        some: () => false,
        string: () => 'x',
        unhangRange: (range: unknown) => range,
      },
      getApi: () => ({
        suggestion: {
          node: () => [suggestionNode, [0, 0]],
        },
      }),
      getOptions: () => ({
        currentUserId: 'alice',
      }),
      selection: {
        anchor: pointCurrent,
        focus: pointCurrent,
      },
      tf: {
        removeNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    deleteSuggestion(editor, {
      anchor: pointCurrent,
      focus: pointTarget,
    });

    expect(removeNodes).toHaveBeenCalledWith({ at: [0, 0] });
  });

  it('deletes inline inserted text directly instead of wrapping it in a remove suggestion', () => {
    const pointCurrent = { offset: 0, path: [0, 0] };
    const pointNext = { offset: 1, path: [0, 0] };
    const target = { offset: 2, path: [0, 0] };
    const suggestionNode = createSuggestionNode({ text: 'x' });
    const move = mock(() => {
      editor.selection = {
        anchor: pointNext,
        focus: pointNext,
      };
    });
    const deleteChar = mock(() => {
      editor.selection = undefined;
    });

    const editor = {
      api: {
        above: () => {},
        after: (point: typeof pointCurrent) =>
          point.offset === 0 ? pointNext : undefined,
        isEnd: () => false,
        isAt: () => false,
        node: () => {},
        pointRef: () => ({ current: target }),
        range: (path: number[]) => ({
          anchor: { offset: 0, path },
          focus: { offset: 2, path },
        }),
        some: () => false,
        string: () => 'x',
        unhangRange: (range: unknown) => range,
      },
      getApi: (plugin: unknown) => {
        expect(plugin).toBe(BaseSuggestionPlugin);

        return {
          suggestion: {
            node: ({ match }: any = {}) =>
              match?.(suggestionNode) ? [suggestionNode, [0, 0]] : undefined,
          },
        };
      },
      getOptions: () => ({
        currentUserId: 'alice',
      }),
      selection: {
        anchor: pointCurrent,
        focus: pointCurrent,
      },
      tf: {
        delete: deleteChar,
        move,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    deleteSuggestion(editor, {
      anchor: pointCurrent,
      focus: target,
    });

    expect(move).toHaveBeenCalledWith({
      reverse: undefined,
      unit: 'character',
    });
    expect(deleteChar).toHaveBeenCalledWith({
      at: {
        anchor: pointCurrent,
        focus: pointNext,
      },
      unit: 'character',
    });
  });

  it('stops cleanly when deletion would cross blocks without a previous block element', () => {
    const pointCurrent = { offset: 0, path: [1, 0] };
    const pointTarget = { offset: 0, path: [0, 0] };
    const move = mock();

    const editor = {
      api: {
        above: () => {},
        after: () => pointTarget,
        before: () => pointTarget,
        isEnd: () => false,
        isAt: ({ blocks }: any = {}) => !!blocks,
        node: () => {},
        pointRef: () => ({ current: pointTarget }),
        range: (path: number[]) => ({
          anchor: { offset: 0, path },
          focus: { offset: 1, path },
        }),
        string: () => '\n',
        unhangRange: (range: unknown) => range,
      },
      getApi: () => ({
        suggestion: {
          node: () => {},
        },
      }),
      getOptions: () => ({
        currentUserId: 'alice',
      }),
      selection: {
        anchor: pointCurrent,
        focus: pointCurrent,
      },
      tf: {
        move,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    deleteSuggestion(editor, {
      anchor: pointCurrent,
      focus: pointTarget,
    });

    expect(move).not.toHaveBeenCalled();
  });
});
