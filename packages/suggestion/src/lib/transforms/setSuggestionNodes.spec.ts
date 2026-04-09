import { KEYS } from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils';
import { setSuggestionNodes } from './setSuggestionNodes';

describe('setSuggestionNodes', () => {
  it('marks the selection and each inline node with shared suggestion metadata', () => {
    const setNodes = mock();
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 1, path: [0, 1] },
    };
    const editor = {
      api: {
        isInline: () => true,
        nodes: () => [
          [{ type: 'a' }, [0, 1]],
          [{ type: 'a' }, [0, 2]],
        ],
      },
      getOptions: (plugin: unknown) => {
        expect(plugin).toBe(BaseSuggestionPlugin);

        return { currentUserId: 'user-1' };
      },
      selection,
      tf: {
        setNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    setSuggestionNodes(editor, {
      createdAt: 123,
      suggestionId: 's-1',
    });

    const props = {
      [KEYS.suggestion]: true,
      [getSuggestionKey('s-1')]: {
        createdAt: 123,
        id: 's-1',
        type: 'remove',
        userId: 'user-1',
      },
    };

    expect(setNodes).toHaveBeenNthCalledWith(1, props, {
      at: selection,
      marks: true,
    });
    expect(setNodes).toHaveBeenNthCalledWith(
      2,
      props,
      expect.objectContaining({
        at: [0, 1],
        match: expect.any(Function),
      })
    );
    expect(setNodes).toHaveBeenNthCalledWith(
      3,
      props,
      expect.objectContaining({
        at: [0, 2],
        match: expect.any(Function),
      })
    );
  });

  it('can skip marking outer inline elements', () => {
    const setNodes = mock();
    const selection = {
      anchor: { offset: 3, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    };
    const editor = {
      api: {
        isInline: () => true,
        nodes: () => [[{ type: 'a' }, [0, 1]]],
      },
      getOptions: (plugin: unknown) => {
        expect(plugin).toBe(BaseSuggestionPlugin);

        return { currentUserId: 'user-1' };
      },
      selection,
      tf: {
        setNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    setSuggestionNodes(editor, {
      createdAt: 123,
      includeInlineElements: false,
      suggestionId: 's-1',
    });

    const props = {
      [KEYS.suggestion]: true,
      [getSuggestionKey('s-1')]: {
        createdAt: 123,
        id: 's-1',
        type: 'remove',
        userId: 'user-1',
      },
    };

    expect(setNodes).toHaveBeenCalledTimes(1);
    expect(setNodes).toHaveBeenCalledWith(props, {
      at: selection,
      marks: true,
    });
  });
});
