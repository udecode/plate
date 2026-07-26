import cloneDeep from 'lodash/cloneDeep.js';

import {
  type Descendant,
  type Element,
  ElementApi,
  type Location,
  type Path,
  type Range,
  type Value,
  defineEffect,
  defineStateField,
  property,
  schema,
  target,
} from '@platejs/plite';
import { createBasePlugin, type InferConfig } from '@platejs/core';
import { KEYS } from '@platejs/utils';
import { SUGGESTION_TRANSIENT_KEY } from '@platejs/suggestion';

export const AI_PREVIEW_KEY = 'aiPreview';

type AIPreviewState = {
  originalBlocks: Value;
  selectionBefore: Range | null;
};

type PreviewRange =
  | { kind: 'invalid' | 'none' }
  | {
      end: number;
      kind: 'range';
      start: number;
    };

const aiBatchEffect = defineEffect<number>({
  invert: (value) => -value,
  key: 'ai.batch',
});

const aiPreviewByEditor = new WeakMap<object, AIPreviewState>();

export const BaseAIPlugin = createBasePlugin({
  extension: {
    effects: [aiBatchEffect],
    fields: [
      defineStateField({
        key: 'ai.batch',
        collab: 'local',
        history: 'push',
        initial: 0,
        reduce: (value, effect) =>
          effect.type === aiBatchEffect ? value + effect.value : value,
      }),
    ],
    name: 'ai-batch',
  },
  key: KEYS.ai,
  render: { isDecoration: false },
  rules: { selection: { affinity: 'outward' } },
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
    properties: [
      schema.elementProperty(AI_PREVIEW_KEY, property.boolean(), {
        split: 'preserve',
        target: target.group('block'),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  },
  update: ({ tx, type }) => ({
    insertNodes: (
      nodes: Descendant[],
      {
        target,
      }: {
        target?: Path;
      } = {}
    ) => {
      const at = target ?? tx.selection()?.focus.path;

      if (!at) return;

      const point = tx.points.end(at);

      if (!point) return;

      tx.nodes.insert(
        nodes.map((node) => ({
          ...node,
          [type]: true,
        })),
        {
          at: point,
          select: true,
        }
      );
      tx.selection.collapse({ edge: 'end' });
    },
    markBatch: () => {
      tx.effects.emit(aiBatchEffect, 1);
    },
    removeMarks: ({ at = [] }: { at?: Location } = {}) => {
      tx.nodes.unset(type, {
        at,
        match: (node) => Boolean(Reflect.get(node, type)),
      });
    },
    removeNodes: ({ at = [] }: { at?: Path } = {}) => {
      tx.nodes.remove({
        at,
        match: (node) =>
          !ElementApi.isElement(node) && Boolean(Reflect.get(node, type)),
      });
    },
  }),
  api: ({ editor, type }) => {
    const getPreview = () => aiPreviewByEditor.get(editor);
    const getPreviewRange = (): PreviewRange => {
      let closed = false;
      let end = -1;
      let invalid = false;
      let start = -1;

      editor.read.children().forEach((node, index) => {
        if (!node?.[AI_PREVIEW_KEY]) {
          if (start !== -1) closed = true;

          return;
        }
        if (closed) {
          invalid = true;

          return;
        }
        if (start === -1) start = index;

        end = index;
      });

      if (invalid) return { kind: 'invalid' };
      if (start === -1 && end === -1) return { kind: 'none' };

      return { end, kind: 'range', start };
    };
    const cancelPreview = () => {
      const preview = getPreview();

      if (!preview) return false;

      const range = getPreviewRange();

      if (range.kind === 'invalid') return false;

      editor.update({ history: 'skip' }, (tx) => {
        if (range.kind === 'range') {
          tx.nodes.replaceChildren(cloneDeep(preview.originalBlocks), {
            at: [],
            count: range.end - range.start + 1,
            index: range.start,
          });
        }

        tx.nodes.remove({
          at: [],
          match: { type: editor.getType(KEYS.aiChat) },
        });

        if (preview.selectionBefore) {
          tx.selection.set(cloneDeep(preview.selectionBefore));
        } else {
          tx.selection.clear();
        }
      });

      aiPreviewByEditor.delete(editor);

      return true;
    };

    return {
      /** Commit the active preview as one fresh undoable batch. */
      acceptPreview: () => {
        const preview = getPreview();

        if (!preview) return false;

        const range = getPreviewRange();

        if (range.kind === 'invalid') return false;

        if (range.kind === 'range') {
          const acceptedBlocks = cloneDeep(
            editor.read.children().slice(range.start, range.end + 1)
          ).map((block) => {
            const stripNode = (node: Descendant): Descendant => {
              if (ElementApi.isElement(node)) {
                const { [AI_PREVIEW_KEY]: _preview, children, ...rest } = node;

                return {
                  ...rest,
                  children: children.map(stripNode),
                };
              }

              const rest = { ...node };

              Reflect.deleteProperty(rest, type);

              return rest;
            };

            return stripNode(block) as Element;
          });

          editor.update({ history: 'skip' }, (tx) => {
            tx.nodes.replaceChildren(cloneDeep(preview.originalBlocks), {
              at: [],
              count: range.end - range.start + 1,
              index: range.start,
            });
            tx.nodes.remove({
              at: [],
              match: { type: editor.getType(KEYS.aiChat) },
            });

            if (preview.selectionBefore) {
              tx.selection.set(cloneDeep(preview.selectionBefore));
            } else {
              tx.selection.clear();
            }
          });

          editor.update({ history: 'new-batch' }, (tx) => {
            tx.effects.emit(aiBatchEffect, 1);
            tx.nodes.replaceChildren(acceptedBlocks, {
              at: [],
              count: preview.originalBlocks.length,
              index: range.start,
            });

            if (acceptedBlocks.length === 0) return;

            const focus = tx.points.end([
              range.start + acceptedBlocks.length - 1,
            ]);

            if (focus) tx.selection.set({ anchor: focus, focus });
          });
        } else {
          editor.update({ history: 'skip' }, (tx) => {
            tx.nodes.remove({
              at: [],
              match: { type: editor.getType(KEYS.aiChat) },
            });
          });
        }

        aiPreviewByEditor.delete(editor);

        return true;
      },
      /** Capture the rollback slice and selection for AI preview. */
      beginPreview: ({
        originalBlocks = [],
      }: {
        originalBlocks?: Value;
      } = {}) => {
        if (getPreview()) return false;

        aiPreviewByEditor.set(editor, {
          originalBlocks: cloneDeep(originalBlocks),
          selectionBefore: cloneDeep(editor.read.selection()),
        });

        return true;
      },
      /** Restore the rollback point and clear active preview state. */
      cancelPreview,
      /** Clear active preview bookkeeping without restoring content. */
      discardPreview: () => {
        if (!getPreview()) return false;

        aiPreviewByEditor.delete(editor);

        return true;
      },
      /** Report whether an AI preview rollback point is active. */
      hasPreview: () => !!getPreview(),
      undo: () => {
        if (getPreview() && cancelPreview()) return;

        const hasAINodeOrAISuggestion =
          editor.read.nodes.some({
            at: [],
            match: (node) => Boolean(Reflect.get(node, type)),
          }) ||
          editor.read.nodes.some({
            at: [],
            match: (node) =>
              Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
          });
        const lastBatch = editor.read.history.undos().at(-1);
        const isAIBatch = lastBatch?.effects.some(
          (effect) => effect.type === aiBatchEffect
        );

        if (isAIBatch && hasAINodeOrAISuggestion) {
          editor.update((tx) => {
            tx.history.undo();
            tx.history.discardRedo();
          });

          return;
        }

        if (hasAINodeOrAISuggestion) cancelPreview();
      },
    };
  },
});

export type BaseAIPluginConfig = InferConfig<typeof BaseAIPlugin>;
