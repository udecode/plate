import { KEYS } from 'platejs';
import * as actualPlatejs from 'platejs';

const deserializeMdMock = mock();
const diffToSuggestionsMock = mock();
const getTransientSuggestionKeyMock = mock(() => '__transient');
const skipSuggestionDeletesMock = mock((_, node) =>
  JSON.stringify(node.children ?? node)
);
const nanoidMock = mock(() => 'generated-id');

mock.module('@platejs/markdown', () => ({
  MarkdownPlugin: { key: 'markdown' },
  deserializeMd: deserializeMdMock,
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { key: 'blockSelection' },
}));

mock.module('@platejs/suggestion', () => ({
  SkipSuggestionDeletes: skipSuggestionDeletesMock,
  diffToSuggestions: diffToSuggestionsMock,
  getTransientSuggestionKey: getTransientSuggestionKeyMock,
}));

mock.module('platejs', () => ({
  ...actualPlatejs,
  ElementApi: {
    isElement: (value: any) =>
      !!value && typeof value === 'object' && Array.isArray(value.children),
  },
  KEYS: {
    ...actualPlatejs.KEYS,
    comment: 'comment',
    cursorOverlay: 'cursorOverlay',
    suggestion: 'suggestion',
    table: 'table',
    td: 'td',
    tr: 'tr',
  },
  TextApi: {
    isText: (value: any) =>
      !!value &&
      typeof value === 'object' &&
      typeof value.text === 'string' &&
      !Array.isArray(value.children),
  },
  nanoid: nanoidMock,
}));

mock.module('../AIChatPlugin', () => ({
  AIChatPlugin: { key: 'aiChat' },
}));

const loadModule = async () =>
  import(`./applyAISuggestions?test=${Math.random().toString(36).slice(2)}`);

describe('applyAISuggestions utils', () => {
  beforeEach(() => {
    deserializeMdMock.mockReset();
    diffToSuggestionsMock.mockReset();
    getTransientSuggestionKeyMock.mockReset();
    getTransientSuggestionKeyMock.mockReturnValue('__transient');
    skipSuggestionDeletesMock.mockReset();
    skipSuggestionDeletesMock.mockImplementation((_, node) =>
      JSON.stringify(node.children ?? node)
    );
    nanoidMock.mockReset();
    nanoidMock.mockReturnValue('generated-id');
  });

  afterAll(() => {
    mock.restore();
  });

  it('strips suggestion and comment payloads from text and element nodes', async () => {
    const { withoutSuggestionAndComments } = await loadModule();

    expect(
      withoutSuggestionAndComments([
        {
          children: [
            {
              [KEYS.comment]: true,
              [KEYS.suggestion]: true,
              text: 'x',
            },
          ],
          [KEYS.suggestion]: {
            id: 's1',
          },
          foo: 'bar',
          suggestion_123: true,
          type: 'p',
        } as any,
      ])
    ).toEqual([
      {
        children: [{ text: 'x' }],
        foo: 'bar',
        type: 'p',
      },
    ]);
  });

  it('marks every node as transient and preserves nested children', async () => {
    const { withTransient } = await loadModule();

    expect(
      withTransient([
        {
          children: [{ text: 'child' }],
          type: 'p',
        } as any,
        { text: 'leaf' } as any,
      ])
    ).toEqual([
      {
        __transient: true,
        children: [{ __transient: true, text: 'child' }],
        type: 'p',
      },
      { __transient: true, text: 'leaf' },
    ]);
  });

  it('replaces multi-block chat nodes, updates block selection, and persists replace ids', async () => {
    const { applyAISuggestions } = await loadModule();
    const setOption = mock();
    const setBlockSelection = mock();
    const replaceNodes = mock();

    deserializeMdMock.mockReturnValue([
      { children: [{ text: 'next' }], type: 'p' },
    ]);
    diffToSuggestionsMock.mockReturnValue([
      { children: [{ text: 'a' }], id: 'id-1', type: 'p' },
      { children: [{ text: 'b' }], id: 'id-2', type: 'p' },
    ]);

    const replaceNodeEntries = [
      [{ id: 'id-1', children: [{ text: 'old-a' }], type: 'p' }, [0]],
      [{ id: 'id-2', children: [{ text: 'old-b' }], type: 'p' }, [1]],
    ];

    const editor = {
      api: {
        nodes: () => replaceNodeEntries,
      },
      getApi: ({ key }: any) => {
        if (key === KEYS.cursorOverlay) {
          return {
            cursorOverlay: { removeCursor: mock() },
          };
        }

        return {
          blockSelection: { set: setBlockSelection },
        };
      },
      getOption: (_plugin: any, key: string) => {
        if (key === '_replaceIds') return [];
        if (key === 'chatNodes') {
          return [
            { id: 'id-1', children: [{ text: 'old-a' }], type: 'p' },
            { id: 'id-2', children: [{ text: 'old-b' }], type: 'p' },
          ];
        }

        return;
      },
      getOptions: () => ({
        chatNodes: [
          { id: 'id-1', children: [{ text: 'old-a' }], type: 'p' },
          { id: 'id-2', children: [{ text: 'old-b' }], type: 'p' },
        ],
      }),
      setOption,
      tf: {
        replaceNodes,
      },
    } as any;

    applyAISuggestions(editor, 'next');

    expect(replaceNodes).toHaveBeenCalledTimes(2);
    expect(setBlockSelection).toHaveBeenCalledWith(['id-1', 'id-2']);
    expect(setOption).toHaveBeenCalledWith({ key: 'aiChat' }, '_replaceIds', [
      'id-1',
      'id-2',
    ]);
  });

  it('inserts fragment suggestions and selects transient text when editing one block', async () => {
    const { applyAISuggestions } = await loadModule();
    const insertFragment = mock();
    const setSelection = mock();
    const nodesRange = mock(() => ({ anchor: 'a', focus: 'b' }));

    deserializeMdMock.mockReturnValue([{ text: 'done' }]);
    diffToSuggestionsMock.mockReturnValue([{ text: 'done' }]);

    const transientEntry = [{ __transient: true, text: 'done' }, [0, 0]];
    const editor = {
      api: {
        nodes: () => [transientEntry],
        nodesRange,
      },
      getApi: ({ key }: any) => {
        if (key === KEYS.cursorOverlay) {
          return {
            cursorOverlay: { removeCursor: mock() },
          };
        }

        return {
          blockSelection: { set: mock() },
        };
      },
      getOptions: () => ({
        chatNodes: [{ id: 'id-1', children: [{ text: 'old' }], type: 'p' }],
      }),
      getOption: (_plugin: any, key: string) => {
        if (key === 'chatNodes') {
          return [{ id: 'id-1', children: [{ text: 'old' }], type: 'p' }];
        }

        return;
      },
      tf: {
        insertFragment,
        setSelection,
      },
    } as any;

    applyAISuggestions(editor, 'done');

    expect(insertFragment).toHaveBeenCalledWith([
      { __transient: true, text: 'done' },
    ]);
    expect(setSelection).toHaveBeenCalledWith({ anchor: 'a', focus: 'b' });
  });
});
