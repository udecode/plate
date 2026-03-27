import { describe, expect, it, mock } from 'bun:test';
import {
  BaseParagraphPlugin,
  KEYS,
  createSlateEditor,
  getPluginType,
} from 'platejs';

import { BaseAIPlugin } from '../BaseAIPlugin';
import {
  acceptAIPreview,
  beginAIPreview,
  cancelAIPreview,
  discardAIPreview,
  hasAIPreview,
} from './aiStreamSnapshot';

const AI_PREVIEW_KEY = 'aiPreview';

const createParagraph = (
  text: string,
  {
    element = {},
    text: textProps = {},
  }: { element?: Record<string, any>; text?: Record<string, any> } = {}
) => ({
  ...element,
  children: [{ text, ...textProps }],
  type: 'p',
});

const createAnchor = () => ({
  children: [{ text: '' }],
  type: 'aiChat',
});

const createEditor = () => {
  const removeNodeAtPath = (children: any[], path: number[]) => {
    if (path.length !== 1) throw new Error(`Unsupported path: ${path}`);

    children.splice(path[0], 1);
  };

  const insertNodesAtPath = (children: any[], nodes: any[], path: number[]) => {
    if (path.length !== 1) throw new Error(`Unsupported path: ${path}`);

    children.splice(path[0], 0, ...structuredClone(nodes));
  };

  const unsetNodeProps = (
    node: any,
    keys: string[],
    match?: (node: any) => boolean
  ) => {
    if (!match || match(node)) {
      for (const key of keys) {
        delete node[key];
      }
    }

    if (node.children) {
      node.children.forEach((child: any) => {
        unsetNodeProps(child, keys, match);
      });
    }
  };

  const editor = {
    children: [createParagraph('start'), createParagraph('untouched')],
    getPlugin: ({ key }: { key: string }) => ({
      key,
      node: { type: key },
    }),
    history: {
      redos: [],
      undos: [],
    },
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    tf: {
      deselect: mock(() => {
        editor.selection = null;
      }),
      insertNodes: mock((nodes: any, options: any = {}) => {
        insertNodesAtPath(
          editor.children,
          Array.isArray(nodes) ? nodes : [nodes],
          options.at ?? [editor.children.length]
        );
      }),
      removeNodes: mock((options: any = {}) => {
        if (options.match) {
          editor.children = editor.children.filter(
            (node: any) => !options.match(node)
          );

          return;
        }

        removeNodeAtPath(editor.children, options.at);
      }),
      select: mock((selection: any) => {
        editor.selection = selection;
      }),
      setValue: mock((value: any) => {
        editor.children = value;
      }),
      unsetNodes: mock((props: string | string[], options: any = {}) => {
        const keys = Array.isArray(props) ? props : [props];
        const path = options.at;

        if (path) {
          unsetNodeProps(editor.children[path[0]], keys, options.match);

          return;
        }

        editor.children.forEach((node: any) => {
          unsetNodeProps(node, keys, options.match);
        });
      }),
      withNewBatch: mock((fn: () => void) => {
        fn();
        editor.history.undos.push({ operations: [{}] });
      }),
      withoutSaving: mock((fn: () => void) => {
        fn();
      }),
    },
  } as any;

  return editor;
};

describe('ai preview transforms', () => {
  it('captures once and keeps the original rollback point', () => {
    const editor = createEditor();
    const initialValue = structuredClone(editor.children);
    const initialSelection = structuredClone(editor.selection);
    const originalBlocks = [structuredClone(editor.children[0])];

    expect(beginAIPreview(editor, { originalBlocks })).toBe(true);

    editor.children = [
      createParagraph('preview', {
        element: { [AI_PREVIEW_KEY]: true },
        text: { ai: true },
      }),
      createAnchor(),
      structuredClone(initialValue[1]),
    ];
    editor.selection = {
      anchor: { offset: 7, path: [0, 0] },
      focus: { offset: 7, path: [0, 0] },
    };

    expect(beginAIPreview(editor, { originalBlocks: [] })).toBe(false);
    expect(cancelAIPreview(editor)).toBe(true);
    expect(editor.children).toEqual(initialValue);
    expect(editor.selection).toEqual(initialSelection);
    expect(editor.tf.setValue).not.toHaveBeenCalled();
  });

  it('cancels safely when no preview exists', () => {
    const editor = createEditor();

    expect(hasAIPreview(editor)).toBe(false);
    expect(cancelAIPreview(editor)).toBe(false);
    expect(discardAIPreview(editor)).toBe(false);
    expect(
      acceptAIPreview(editor, [{ children: [{ text: 'done' }], type: 'p' }])
    ).toBe(false);
  });

  it('discards preview bookkeeping without restoring content', () => {
    const editor = createEditor();

    beginAIPreview(editor, { originalBlocks: [] });
    editor.children = [
      createParagraph('preview', { element: { [AI_PREVIEW_KEY]: true } }),
    ];
    editor.selection = null;

    expect(discardAIPreview(editor)).toBe(true);
    expect(hasAIPreview(editor)).toBe(false);
    expect(editor.children).toEqual([
      createParagraph('preview', { element: { [AI_PREVIEW_KEY]: true } }),
    ]);
    expect(editor.selection).toBeNull();
  });

  it('restores a null snapshot selection by deselecting', () => {
    const editor = createEditor();

    editor.selection = null;
    beginAIPreview(editor, {
      originalBlocks: [structuredClone(editor.children[0])],
    });
    editor.selection = {
      anchor: { offset: 7, path: [0, 0] },
      focus: { offset: 7, path: [0, 0] },
    };
    editor.children = [
      createParagraph('preview', {
        element: { [AI_PREVIEW_KEY]: true },
        text: { ai: true },
      }),
      createAnchor(),
      createParagraph('untouched'),
    ];

    expect(cancelAIPreview(editor)).toBe(true);
    expect(editor.tf.deselect).toHaveBeenCalledTimes(1);
    expect(editor.selection).toBeNull();
  });

  it('accepts preview as one localized batch and clears preview state', () => {
    const editor = createEditor();
    const initialSelection = structuredClone(editor.selection);

    beginAIPreview(editor, {
      originalBlocks: [structuredClone(editor.children[0])],
    });
    editor.children = [
      createParagraph('accepted', {
        element: { [AI_PREVIEW_KEY]: true },
        text: { ai: true },
      }),
      createAnchor(),
      createParagraph('untouched'),
    ];

    expect(acceptAIPreview(editor)).toBe(true);
    expect(editor.tf.withNewBatch).toHaveBeenCalledTimes(1);
    expect(editor.tf.setValue).not.toHaveBeenCalled();
    expect(editor.children).toEqual([
      createParagraph('accepted'),
      createParagraph('untouched'),
    ]);
    expect(hasAIPreview(editor)).toBe(false);
    expect(editor.history.undos.at(-1)?.selectionBefore).toEqual(
      initialSelection
    );
  });

  it('registers the preview lifecycle on BaseAIPlugin transforms', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseAIPlugin],
      selection: {
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      value: [{ children: [{ text: 'start' }], type: 'p' }],
    });
    const initialValue = structuredClone(editor.children);
    const ai = editor.getTransforms(BaseAIPlugin).ai;
    const aiType = getPluginType(editor, KEYS.ai);
    const aiChatType = getPluginType(editor, KEYS.aiChat);

    expect(ai.hasPreview()).toBe(false);
    expect(ai.beginPreview({ originalBlocks: [] })).toBe(true);

    editor.tf.withoutSaving(() => {
      editor.tf.insertNodes(
        [
          {
            children: [{ text: 'accepted', [aiType]: true }],
            [AI_PREVIEW_KEY]: true,
            type: 'p',
          },
          {
            children: [{ text: '' }],
            type: aiChatType,
          },
        ],
        { at: [1] }
      );
    });

    expect(editor.history.undos).toHaveLength(0);
    expect(ai.acceptPreview()).toBe(true);
    expect(editor.children).toEqual([
      { children: [{ text: 'start' }], type: 'p' },
      { children: [{ text: 'accepted' }], type: 'p' },
    ]);
    expect(editor.history.undos).toHaveLength(1);
    expect(editor.history.undos[0]?.selectionBefore).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });

    editor.undo();

    expect(editor.children).toEqual(initialValue);
    expect(editor.selection).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
  });
});
