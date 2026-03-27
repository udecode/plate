import cloneDeep from 'lodash/cloneDeep.js';
import {
  ElementApi,
  KEYS,
  type SlateEditor,
  type TRange,
  type Value,
  getPluginType,
} from 'platejs';

type AIPreviewState = {
  originalBlocks: Value;
  selectionBefore: TRange | null;
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

const AI_STREAM_SNAPSHOT = new WeakMap<SlateEditor, AIPreviewState>();

const clearAIPreview = (editor: SlateEditor) => {
  AI_STREAM_SNAPSHOT.delete(editor);
};

const getAIPreview = (editor: SlateEditor) => AI_STREAM_SNAPSHOT.get(editor);

const getAIPreviewRange = (editor: SlateEditor): PreviewRange => {
  let closed = false;
  let end = -1;
  let invalid = false;
  let start = -1;

  editor.children.forEach((node: any, index) => {
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

const removeAIPreviewAnchor = (editor: SlateEditor) => {
  const aiChatType = getPluginType(editor, KEYS.aiChat);

  editor.tf.removeNodes({
    at: [],
    match: (node) => ElementApi.isElement(node) && node.type === aiChatType,
  });
};

const restoreAIPreviewSelection = (
  editor: SlateEditor,
  selection: TRange | null
) => {
  if (selection) {
    editor.tf.select(cloneDeep(selection));

    return;
  }

  editor.tf.deselect();
};

const removePreviewRange = (
  editor: SlateEditor,
  range: Extract<PreviewRange, { kind: 'range' }>
) => {
  for (let index = range.end; index >= range.start; index--) {
    editor.tf.removeNodes({ at: [index] });
  }
};

const replacePreviewRange = (
  editor: SlateEditor,
  range: Extract<PreviewRange, { kind: 'range' }>,
  blocks: Value
) => {
  removePreviewRange(editor, range);

  if (blocks.length === 0) return;

  editor.tf.insertNodes(cloneDeep(blocks), { at: [range.start] });
};

const cloneAcceptedPreviewBlocks = (
  editor: SlateEditor,
  range: Extract<PreviewRange, { kind: 'range' }>
) => {
  const aiType = getPluginType(editor, KEYS.ai);
  const blocks = cloneDeep(editor.children.slice(range.start, range.end + 1));

  const stripNode = (node: any): any => {
    if (ElementApi.isElement(node)) {
      const { [AI_PREVIEW_KEY]: _preview, children, ...rest } = node;

      return {
        ...rest,
        children: children.map(stripNode),
      };
    }

    const { [aiType]: _ai, ...rest } = node;

    return rest;
  };

  return blocks.map(stripNode);
};

export const beginAIPreview = (
  editor: SlateEditor,
  { originalBlocks = [] }: BeginAIPreviewOptions = {}
) => {
  if (getAIPreview(editor)) return false;

  AI_STREAM_SNAPSHOT.set(editor, {
    originalBlocks: cloneDeep(originalBlocks),
    selectionBefore: cloneDeep(editor.selection),
  });

  return true;
};

export const hasAIPreview = (editor: SlateEditor) => !!getAIPreview(editor);

export const cancelAIPreview = (editor: SlateEditor) => {
  const preview = getAIPreview(editor);

  if (!preview) return false;

  const range = getAIPreviewRange(editor);

  if (range.kind === 'invalid') return false;

  editor.tf.withoutSaving(() => {
    if (range.kind === 'range') {
      replacePreviewRange(editor, range, preview.originalBlocks);
    }

    removeAIPreviewAnchor(editor);
    restoreAIPreviewSelection(editor, preview.selectionBefore);
  });

  clearAIPreview(editor);

  return true;
};

export const discardAIPreview = (editor: SlateEditor) => {
  if (!getAIPreview(editor)) return false;

  clearAIPreview(editor);

  return true;
};

export const acceptAIPreview = (editor: SlateEditor, _value?: Value) => {
  const preview = getAIPreview(editor);

  if (!preview) return false;

  const range = getAIPreviewRange(editor);

  if (range.kind === 'invalid') return false;

  if (range.kind === 'range') {
    const acceptedBlocks = cloneAcceptedPreviewBlocks(editor, range);

    editor.tf.withoutSaving(() => {
      replacePreviewRange(editor, range, preview.originalBlocks);
      removeAIPreviewAnchor(editor);
      restoreAIPreviewSelection(editor, preview.selectionBefore);
    });

    editor.tf.withNewBatch(() => {
      if (preview.originalBlocks.length > 0) {
        for (
          let index = preview.originalBlocks.length - 1;
          index >= 0;
          index--
        ) {
          editor.tf.removeNodes({ at: [range.start + index] });
        }
      }

      if (acceptedBlocks.length > 0) {
        editor.tf.insertNodes(acceptedBlocks, { at: [range.start] });
      }
    });

    const lastBatch = editor.history?.undos.at(-1);

    if (lastBatch) {
      lastBatch.selectionBefore = cloneDeep(preview.selectionBefore);
    }
  } else {
    editor.tf.withoutSaving(() => {
      removeAIPreviewAnchor(editor);
    });
  }

  clearAIPreview(editor);

  return true;
};
