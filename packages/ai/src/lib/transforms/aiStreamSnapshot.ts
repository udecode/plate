import cloneDeep from 'lodash/cloneDeep.js';
import type { BaseEditor } from '@platejs/core';
import {
  type Descendant,
  type EditorUpdateTransaction,
  type Element,
  ElementApi,
  type Range,
  type Value,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { getPluginType } from '@platejs/core';

import { withAIBatch } from './withAIBatch';

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

const AI_STREAM_SNAPSHOT = new WeakMap<BaseEditor, AIPreviewState>();

const clearAIPreview = (editor: BaseEditor) => {
  AI_STREAM_SNAPSHOT.delete(editor);
};

const getAIPreview = (editor: BaseEditor) => AI_STREAM_SNAPSHOT.get(editor);

const getAIPreviewRange = (editor: BaseEditor): PreviewRange => {
  let closed = false;
  let end = -1;
  let invalid = false;
  let start = -1;

  editor.read.children().forEach((node, index) => {
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

const removeAIPreviewAnchor = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const aiChatType = getPluginType(editor, KEYS.aiChat);

  tx.nodes.remove({
    at: [],
    match: { type: aiChatType },
  });
};

const restoreAIPreviewSelection = (
  tx: EditorUpdateTransaction,
  selection: Range | null
) => {
  if (selection) {
    tx.selection.set(cloneDeep(selection));

    return;
  }

  tx.selection.clear();
};

const replacePreviewRange = (
  tx: EditorUpdateTransaction,
  range: Extract<PreviewRange, { kind: 'range' }>,
  blocks: Value
) => {
  tx.nodes.replaceChildren(cloneDeep(blocks), {
    at: [],
    count: range.end - range.start + 1,
    index: range.start,
  });
};

const cloneAcceptedPreviewBlocks = (
  editor: BaseEditor,
  range: Extract<PreviewRange, { kind: 'range' }>
) => {
  const aiType = getPluginType(editor, KEYS.ai);
  const blocks = cloneDeep(
    editor.read.children().slice(range.start, range.end + 1)
  );

  function stripElement(node: Element): Element {
    const { [AI_PREVIEW_KEY]: _preview, children, ...rest } = node;

    return {
      ...rest,
      children: children.map(stripNode),
    };
  }

  function stripNode(node: Descendant): Descendant {
    if (ElementApi.isElement(node)) return stripElement(node);

    const rest = { ...node };

    Reflect.deleteProperty(rest, aiType);

    return rest;
  }

  return blocks.map(stripElement);
};

export const beginAIPreview = (
  editor: BaseEditor,
  { originalBlocks = [] }: BeginAIPreviewOptions = {}
) => {
  if (getAIPreview(editor)) return false;

  AI_STREAM_SNAPSHOT.set(editor, {
    originalBlocks: cloneDeep(originalBlocks),
    selectionBefore: cloneDeep(editor.read.selection()),
  });

  return true;
};

export const hasAIPreview = (editor: BaseEditor) => !!getAIPreview(editor);

export const cancelAIPreview = (editor: BaseEditor) => {
  const preview = getAIPreview(editor);

  if (!preview) return false;

  const range = getAIPreviewRange(editor);

  if (range.kind === 'invalid') return false;

  editor.update.history.skip((tx) => {
    if (range.kind === 'range') {
      replacePreviewRange(tx, range, preview.originalBlocks);
    }

    removeAIPreviewAnchor(editor, tx);
    restoreAIPreviewSelection(tx, preview.selectionBefore);
  });

  clearAIPreview(editor);

  return true;
};

export const discardAIPreview = (editor: BaseEditor) => {
  if (!getAIPreview(editor)) return false;

  clearAIPreview(editor);

  return true;
};

export const acceptAIPreview = (editor: BaseEditor, _value?: Value) => {
  const preview = getAIPreview(editor);

  if (!preview) return false;

  const range = getAIPreviewRange(editor);

  if (range.kind === 'invalid') return false;

  if (range.kind === 'range') {
    const acceptedBlocks = cloneAcceptedPreviewBlocks(editor, range);

    editor.update.history.skip((tx) => {
      replacePreviewRange(tx, range, preview.originalBlocks);
      removeAIPreviewAnchor(editor, tx);
      restoreAIPreviewSelection(tx, preview.selectionBefore);
    });

    withAIBatch(
      editor,
      (tx) => {
        tx.nodes.replaceChildren(acceptedBlocks, {
          at: [],
          count: preview.originalBlocks.length,
          index: range.start,
        });
      },
      { split: true }
    );
  } else {
    editor.update.history.skip((tx) => {
      removeAIPreviewAnchor(editor, tx);
    });
  }

  clearAIPreview(editor);

  return true;
};
