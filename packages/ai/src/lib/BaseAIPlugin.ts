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
  | { kind: 'invalid' }
  | { kind: 'none' }
  | {
      end: number;
      kind: 'range';
      start: number;
    };

const aiBatchEffect = defineEffect<number>({
  invert: (value) => -value,
  key: 'ai.batch',
});

const aiBatchField = defineStateField({
  key: 'ai.batch',
  collab: 'local',
  history: 'push',
  initial: 0,
  reduce: (value, effect) =>
    effect.type === aiBatchEffect ? value + effect.value : value,
});

const aiPreviewField = defineStateField<AIPreviewState | null>({
  key: 'ai.preview',
  collab: 'local',
  history: 'skip',
  initial: null,
});

const getPreviewRange = (children: readonly Descendant[]): PreviewRange => {
  let closed = false;
  let end = -1;
  let invalid = false;
  let start = -1;

  children.forEach((node, index) => {
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

export const BaseAIPlugin = createBasePlugin({
  extension: {
    effects: [aiBatchEffect, aiPreviewField.effect],
    fields: [aiBatchField, aiPreviewField],
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
  read: ({ state }) => ({
    hasPreview: () => state.getField(aiPreviewField) !== null,
  }),
  update: ({ context, editor, tx, type }) => {
    const cancelPreview = () => {
      const preview = tx.getField(aiPreviewField);

      if (!preview) return false;

      const range = getPreviewRange(tx.children());

      if (range.kind === 'invalid') return false;

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

      tx.setField(aiPreviewField, null);

      return true;
    };

    return {
      acceptPreview: () => {
        const preview = tx.getField(aiPreviewField);

        if (!preview) return false;

        const range = getPreviewRange(tx.children());

        if (range.kind === 'invalid') return false;
        if (range.kind === 'none') return cancelPreview();

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
        const acceptedBlocks = cloneDeep(
          tx.children().slice(range.start, range.end + 1)
        ).map((block) => stripNode(block) as Element);

        if (!cancelPreview()) return false;

        tx.history.skip();
        context.afterCommit(() => {
          editor.update({ history: 'new-batch' }, (nextTx) => {
            nextTx.effects.emit(aiBatchEffect, 1);
            nextTx.nodes.replaceChildren(acceptedBlocks, {
              at: [],
              count: preview.originalBlocks.length,
              index: range.start,
            });

            if (acceptedBlocks.length === 0) return;

            const focus = nextTx.points.end([
              range.start + acceptedBlocks.length - 1,
            ]);

            if (focus) nextTx.selection.set({ anchor: focus, focus });
          });
        });

        return true;
      },
      beginPreview: ({
        originalBlocks = [],
      }: {
        originalBlocks?: Value;
      } = {}) => {
        if (tx.getField(aiPreviewField)) return false;

        tx.setField(aiPreviewField, {
          originalBlocks: cloneDeep(originalBlocks),
          selectionBefore: cloneDeep(tx.selection()),
        });

        return true;
      },
      cancelPreview,
      discardPreview: () => {
        if (!tx.getField(aiPreviewField)) return false;

        tx.setField(aiPreviewField, null);

        return true;
      },
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
      undo: () => {
        if (tx.getField(aiPreviewField)) return cancelPreview();

        const hasAINodeOrAISuggestion =
          tx.nodes.some({
            at: [],
            match: (node) => Boolean(Reflect.get(node, type)),
          }) ||
          tx.nodes.some({
            at: [],
            match: (node) =>
              Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
          });
        const lastBatch = editor.read.history.undos().at(-1);
        const isAIBatch = lastBatch?.effects.some(
          (effect) => effect.type === aiBatchEffect
        );

        if (!isAIBatch || !hasAINodeOrAISuggestion) return false;

        tx.history.undo();
        tx.history.discardRedo();

        return true;
      },
    };
  },
});

export type BaseAIPluginConfig = InferConfig<typeof BaseAIPlugin>;
