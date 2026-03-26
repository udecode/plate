import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const deserializeMdMock = mock();
const diffToSuggestionsMock = mock();
const acceptSuggestionMock = mock();
const rejectSuggestionMock = mock();
const getSuggestionKeyMock = mock((id: string) => `key:${id}`);
const getTransientSuggestionKeyMock = mock(() => '__transient');
const getEditorPluginMock = mock();
const useEditorPluginMock = mock();
const usePluginOptionMock = mock();

mock.module('@platejs/markdown', () => ({
  MarkdownPlugin: { key: 'markdown' },
  deserializeMd: deserializeMdMock,
}));

mock.module('./applyAISuggestions', () => ({
  withTransient: (nodes: any[]) =>
    nodes.map((node) => ({
      ...node,
      __transient: true,
    })),
  withoutSuggestionAndComments: (nodes: any[]) => nodes,
}));

mock.module('@platejs/suggestion', () => ({
  SkipSuggestionDeletes: (_editor: any, node: any) => node,
  acceptSuggestion: acceptSuggestionMock,
  diffToSuggestions: diffToSuggestionsMock,
  getSuggestionKey: getSuggestionKeyMock,
  getTransientSuggestionKey: getTransientSuggestionKeyMock,
  rejectSuggestion: rejectSuggestionMock,
}));

mock.module('@platejs/suggestion/react', () => ({
  SuggestionPlugin: { key: 'suggestion' },
}));

mock.module('platejs/react', async () => {
  const actual = await import(
    new URL('../../../../../plate/dist/react/index.js', import.meta.url).href
  );
  const getEditorPlugin = actual.getEditorPlugin as any;
  const useEditorPlugin = actual.useEditorPlugin as any;
  const usePluginOption = actual.usePluginOption as any;

  return {
    ...actual,
    getEditorPlugin: (...args: any[]) =>
      (getEditorPluginMock as any)(...args) ?? getEditorPlugin(...args),
    useEditorPlugin: (...args: any[]) =>
      (useEditorPluginMock as any)(...args) ?? useEditorPlugin(...args),
    usePluginOption: (...args: any[]) =>
      (usePluginOptionMock as any)(...args) ?? usePluginOption(...args),
  };
});

const loadApplyTableCellSuggestion = async () =>
  import(
    `./applyTableCellSuggestion?test=${Math.random().toString(36).slice(2)}`
  );
const loadAccept = async () =>
  import(`./acceptAISuggestions?test=${Math.random().toString(36).slice(2)}`);
const loadReject = async () =>
  import(`./rejectAISuggestions?test=${Math.random().toString(36).slice(2)}`);
const loadReset = async () =>
  import(`./resetAIChat?test=${Math.random().toString(36).slice(2)}`);
const loadNested = async () =>
  import(`./nestedContainerUtils?test=${Math.random().toString(36).slice(2)}`);

describe('ai chat action utils', () => {
  beforeEach(() => {
    deserializeMdMock.mockReset();
    diffToSuggestionsMock.mockReset();
    acceptSuggestionMock.mockReset();
    rejectSuggestionMock.mockReset();
    getSuggestionKeyMock.mockReset();
    getSuggestionKeyMock.mockImplementation((id: string) => `key:${id}`);
    getTransientSuggestionKeyMock.mockReset();
    getTransientSuggestionKeyMock.mockReturnValue('__transient');
    getEditorPluginMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('diffs a table cell update and replaces only the cell children', async () => {
    const { applyTableCellSuggestion } = await loadApplyTableCellSuggestion();
    const replaceNodes = mock();

    deserializeMdMock.mockReturnValue([{ text: 'ai' }]);
    diffToSuggestionsMock.mockReturnValue([{ text: 'ai' }]);

    const editor = {
      api: {
        node: () => [
          { children: [{ text: 'old' }], id: 'cell-1', type: 'td' },
          [0, 0, 0],
        ],
      },
      tf: {
        replaceNodes,
      },
    } as any;

    applyTableCellSuggestion(editor, { content: 'ai', id: 'cell-1' });

    expect(replaceNodes).toHaveBeenCalledWith(
      [{ __transient: true, text: 'ai' }],
      {
        at: [0, 0, 0],
        children: true,
      }
    );
  });

  it('accepts transient suggestions and clears transient marks', async () => {
    const { acceptAISuggestions } = await loadAccept();
    const unsetNodes = mock();
    const suggestionNode = {
      suggestion: {
        createdAt: '2024-01-01T00:00:00.000Z',
        id: 's1',
        type: 'insert',
        userId: 'u1',
      },
    };
    const editor = {
      getApi: () => ({
        suggestion: {
          nodes: () => [[suggestionNode, [0]]],
          suggestionData: () => suggestionNode.suggestion,
        },
      }),
      tf: { unsetNodes },
    } as any;

    acceptAISuggestions(editor);

    expect(acceptSuggestionMock).toHaveBeenCalledWith(editor, {
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      keyId: 'key:s1',
      suggestionId: 's1',
      type: 'insert',
      userId: 'u1',
    });
    expect(unsetNodes).toHaveBeenCalledWith(
      ['__transient'],
      expect.any(Object)
    );
  });

  it('rejects transient suggestions and clears transient marks', async () => {
    const { rejectAISuggestions } = await loadReject();
    const unsetNodes = mock();
    const suggestionNode = {
      suggestion: {
        createdAt: '2024-01-01T00:00:00.000Z',
        id: 's1',
        type: 'remove',
        userId: 'u1',
      },
    };
    const editor = {
      getApi: () => ({
        suggestion: {
          nodes: () => [[suggestionNode, [0]]],
          suggestionData: () => suggestionNode.suggestion,
        },
      }),
      tf: { unsetNodes },
    } as any;

    rejectAISuggestions(editor);

    expect(rejectSuggestionMock).toHaveBeenCalledWith(editor, {
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      keyId: 'key:s1',
      suggestionId: 's1',
      type: 'remove',
      userId: 'u1',
    });
    expect(unsetNodes).toHaveBeenCalledWith(
      ['__transient'],
      expect.any(Object)
    );
  });

  it('stops chat, clears messages, resets options, and optionally undoes', async () => {
    const { resetAIChat } = await loadReset();
    const setMessages = mock();
    const stop = mock();
    const setOptions = mock();
    const discardPreview = mock();
    const undo = mock();

    getEditorPluginMock.mockReturnValue({
      api: {
        aiChat: { stop },
      },
      getOptions: () => ({
        chat: {
          messages: [{ id: 'm1' }],
          setMessages,
        },
      }),
      setOptions,
    });

    const editor = {
      getTransforms: () => ({
        ai: { discardPreview, undo },
      }),
    } as any;

    resetAIChat(editor);

    expect(stop).toHaveBeenCalled();
    expect(setMessages).toHaveBeenCalledWith([]);
    expect(setOptions).toHaveBeenCalledWith({
      _replaceIds: [],
      chatNodes: [],
      mode: 'insert',
      toolName: null,
    });
    expect(undo).toHaveBeenCalled();
    expect(discardPreview).not.toHaveBeenCalled();
  });

  it('discards preview bookkeeping instead of undoing when requested', async () => {
    const { resetAIChat } = await loadReset();
    const stop = mock();
    const setOptions = mock();
    const discardPreview = mock();
    const undo = mock();

    getEditorPluginMock.mockReturnValue({
      api: {
        aiChat: { stop },
      },
      getOptions: () => ({
        chat: {
          messages: [],
          setMessages: mock(),
        },
      }),
      setOptions,
    });

    const editor = {
      getTransforms: () => ({
        ai: { discardPreview, undo },
      }),
    } as any;

    resetAIChat(editor, { undo: false });

    expect(stop).toHaveBeenCalled();
    expect(undo).not.toHaveBeenCalled();
    expect(discardPreview).toHaveBeenCalled();
  });

  it('detects single-cell tables and extracts their cell children', async () => {
    const { getTableCellChildren, isSingleCellTable } = await loadNested();
    const table = {
      children: [
        {
          children: [{ children: [{ text: 'x' }], type: 'td' }],
          type: 'tr',
        },
      ],
      type: 'table',
    } as any;

    expect(isSingleCellTable([table])).toBe(true);
    expect(getTableCellChildren(table)).toEqual([{ text: 'x' }]);
    expect(isSingleCellTable([{ type: 'p' } as any])).toBe(false);
  });
});
