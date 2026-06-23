import cloneDeep from 'lodash/cloneDeep.js';
import type { Descendant, Element, Range } from '@platejs/plite';
import {
  ElementApi,
  KEYS,
  type BasePlateEditor,
  type Value,
  getPluginType,
} from 'platejs';

import { getEditorHistory } from '../internal/history';

type AIPreviewState = {
  originalBlocks: Value;
  selectionBefore: Range | null;
};

type BeginAIPreviewOptions = {
  originalBlocks?: Value;
};

type PreviewRange =
  | { kind: 'invalid' | 'none' }
  | {
      end: number;
      kind: 'range';
      start: number;
    };

export const AI_PREVIEW_KEY = 'aiPreview';

const AI_STREAM_SNAPSHOT = new WeakMap<BasePlateEditor, AIPreviewState>();

type DecoratedNode = Descendant & Record<string, unknown>;

const clearAIPreview = (editor: BasePlateEditor) => {
  AI_STREAM_SNAPSHOT.delete(editor);
};

const getAIPreview = (editor: BasePlateEditor) =>
  AI_STREAM_SNAPSHOT.get(editor);

const withoutSaving = (editor: BasePlateEditor, fn: () => void) => {
  const run =
    editor.api.history?.withoutSaving ?? ((callback: () => void) => callback());

  run(fn);
};

const withNewBatch = (editor: BasePlateEditor, fn: () => void) => {
  const run =
    editor.api.history?.withNewBatch ?? ((callback: () => void) => callback());

  run(fn);
};

const getAIPreviewRange = (editor: BasePlateEditor): PreviewRange => {
  let closed = false;
  let end = -1;
  let invalid = false;
  let start = -1;

  editor.children.forEach((node: DecoratedNode, index) => {
    if (!node?.[AI_PREVIEW_KEY]) {
      if (start !== -1) {
        closed = true;
      }

      return;
    }

    if (closed) {
      invalid = true;
      return;
    }

    if (start === -1) {
      start = index;
    }

    end = index;
  });

  if (invalid) return { kind: 'invalid' };
  if (start === -1 && end === -1) return { kind: 'none' };

  return {
    end,
    kind: 'range',
    start,
  };
};

const removeAIPreviewAnchor = (editor: BasePlateEditor) => {
  const aiChatType = getPluginType(editor, KEYS.aiChat);

  editor.update((tx) => {
    tx.nodes.remove({
      at: [],
      match: (node) => ElementApi.isElement(node) && node.type === aiChatType,
    });
  });
};

const restoreAIPreviewSelection = (
  editor: BasePlateEditor,
  selection: Range | null
) => {
  editor.update((tx) => {
    if (selection) {
      tx.selection.set(cloneDeep(selection));
      return;
    }

    tx.selection.clear();
  });
};

const removePreviewRange = (
  editor: BasePlateEditor,
  range: Extract<PreviewRange, { kind: 'range' }>
) => {
  for (let index = range.end; index >= range.start; index--) {
    editor.update((tx) => {
      tx.nodes.remove({ at: [index] });
    });
  }
};

const replacePreviewRange = (
  editor: BasePlateEditor,
  range: Extract<PreviewRange, { kind: 'range' }>,
  blocks: Value
) => {
  removePreviewRange(editor, range);

  if (blocks.length === 0) return;

  editor.update((tx) => {
    tx.nodes.insert(cloneDeep(blocks), { at: [range.start] });
  });
};

const cloneAcceptedPreviewBlocks = (
  editor: BasePlateEditor,
  range: Extract<PreviewRange, { kind: 'range' }>
) => {
  const aiType = getPluginType(editor, KEYS.ai);
  const blocks = cloneDeep(editor.children.slice(range.start, range.end + 1));

  const stripNode = (node: Descendant): Descendant => {
    if (ElementApi.isElement(node)) {
      const { children } = node;
      const {
        [AI_PREVIEW_KEY]: _preview,
        children: _children,
        ...rest
      } = node as Element & Record<string, unknown>;

      return {
        ...rest,
        children: children.map(stripNode),
      } as Descendant;
    }

    const { [aiType]: _ai, ...rest } = node as DecoratedNode;

    return rest as Descendant;
  };

  return blocks.map(stripNode);
};

export const beginAIPreview = (
  editor: BasePlateEditor,
  { originalBlocks = [] }: BeginAIPreviewOptions = {}
) => {
  if (getAIPreview(editor)) return false;

  AI_STREAM_SNAPSHOT.set(editor, {
    originalBlocks: cloneDeep(originalBlocks),
    selectionBefore: cloneDeep(editor.selection),
  });

  return true;
};

export const hasAIPreview = (editor: BasePlateEditor) => !!getAIPreview(editor);

export const cancelAIPreview = (editor: BasePlateEditor) => {
  const preview = getAIPreview(editor);

  if (!preview) return false;

  const range = getAIPreviewRange(editor);

  if (range.kind === 'invalid') return false;

  withoutSaving(editor, () => {
    if (range.kind === 'range') {
      replacePreviewRange(editor, range, preview.originalBlocks);
    }

    removeAIPreviewAnchor(editor);
    restoreAIPreviewSelection(editor, preview.selectionBefore);
  });

  clearAIPreview(editor);

  return true;
};

export const discardAIPreview = (editor: BasePlateEditor) => {
  if (!getAIPreview(editor)) return false;

  clearAIPreview(editor);

  return true;
};

export const acceptAIPreview = (editor: BasePlateEditor, _value?: Value) => {
  const preview = getAIPreview(editor);

  if (!preview) return false;

  const range = getAIPreviewRange(editor);

  if (range.kind === 'invalid') return false;

  if (range.kind === 'range') {
    const acceptedBlocks = cloneAcceptedPreviewBlocks(editor, range);

    withoutSaving(editor, () => {
      replacePreviewRange(editor, range, preview.originalBlocks);
      removeAIPreviewAnchor(editor);
      restoreAIPreviewSelection(editor, preview.selectionBefore);
    });

    withNewBatch(editor, () => {
      if (preview.originalBlocks.length > 0) {
        for (
          let index = preview.originalBlocks.length - 1;
          index >= 0;
          index--
        ) {
          editor.update((tx) => {
            tx.nodes.remove({ at: [range.start + index] });
          });
        }
      }

      if (acceptedBlocks.length > 0) {
        editor.update((tx) => {
          tx.nodes.insert(acceptedBlocks, { at: [range.start] });
        });
      }
    });

    const lastBatch = getEditorHistory(editor).undos.at(-1);

    if (lastBatch) {
      lastBatch.selectionBefore = cloneDeep(preview.selectionBefore);
    }
  } else {
    withoutSaving(editor, () => {
      removeAIPreviewAnchor(editor);
    });
  }

  clearAIPreview(editor);

  return true;
};
