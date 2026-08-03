import { distance } from 'fastest-levenshtein';
import cloneDeep from 'lodash/cloneDeep.js';

import {
  type Descendant,
  type Element,
  ElementApi,
  type Location,
  NodeApi,
  type NodeEntry,
  type Path,
  type Range,
  type Value,
  defineEffect,
  defineStateField,
  property,
  schema,
  target,
} from '@platejs/plite';
import { defineBasePlugin, type DefinitionOf } from '@platejs/core';
import { PLUGINS } from '@platejs/utils';
import { SUGGESTION_TRANSIENT_KEY } from '@platejs/suggestion';

export const AI_PREVIEW_KEY = 'aiPreview';

type AIPreviewState = {
  originalBlocks: Value;
  selectionBefore: Range | null;
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

export const BaseAIPlugin = defineBasePlugin(PLUGINS.ai, {
  api: () => ({
    findTextRangeInBlock: ({
      block,
      findText,
    }: {
      block: NodeEntry;
      findText: string;
    }): Range | null => {
      const [blockNode, blockPath] = block;
      const textSegments: { offset: number; path: Path; text: string }[] = [];
      let fullText = '';

      for (const [textNode, textPath] of NodeApi.texts(blockNode)) {
        const startOffset = fullText.length;
        const absolutePath = [...blockPath, ...textPath];

        textSegments.push({
          offset: startOffset,
          path: absolutePath,
          text: textNode.text,
        });
        fullText += textNode.text;
      }

      if (!fullText) return null;

      let matchStart = fullText.indexOf(findText);
      let matchEnd = matchStart >= 0 ? matchStart + findText.length : -1;

      if (matchStart === -1) {
        const maxDistance =
          findText.length <= 2
            ? 0
            : findText.length <= 5
              ? 1
              : findText.length <= 10
                ? 2
                : findText.length <= 20
                  ? 3
                  : 5;
        let bestMatch = {
          distance: Number.POSITIVE_INFINITY,
          end: -1,
          start: -1,
        };

        for (
          let index = 0;
          index <= fullText.length - findText.length;
          index++
        ) {
          for (
            let lengthOffset = -maxDistance;
            lengthOffset <= maxDistance;
            lengthOffset++
          ) {
            const length = findText.length + lengthOffset;

            if (length <= 0 || index + length > fullText.length) continue;

            const candidate = fullText.slice(index, index + length);
            const candidateDistance = distance(candidate, findText);

            if (
              candidateDistance <= maxDistance &&
              candidateDistance < bestMatch.distance
            ) {
              bestMatch = {
                distance: candidateDistance,
                end: index + length,
                start: index,
              };
            }
          }
        }

        if (bestMatch.start !== -1) {
          matchStart = bestMatch.start;
          matchEnd = bestMatch.end;
        }
      }

      if (matchStart === -1) {
        for (
          let prefixLength = findText.length - 1;
          prefixLength > 0;
          prefixLength--
        ) {
          const prefix = findText.slice(0, prefixLength);
          const index = fullText.indexOf(prefix);

          if (index === -1) continue;

          matchStart = index;
          matchEnd = index + prefixLength;
          break;
        }
      }

      if (matchStart === -1) return null;

      const findPoint = (characterOffset: number, end = false) => {
        if (!end) {
          for (const segment of textSegments) {
            if (characterOffset === segment.offset) {
              return { offset: 0, path: segment.path };
            }
          }
        }

        for (const segment of textSegments) {
          const segmentEnd = segment.offset + segment.text.length;

          if (
            characterOffset >= segment.offset &&
            characterOffset <= segmentEnd
          ) {
            return {
              offset: characterOffset - segment.offset,
              path: segment.path,
            };
          }
        }

        const lastSegment = textSegments.at(-1);

        return lastSegment
          ? { offset: lastSegment.text.length, path: lastSegment.path }
          : { offset: 0, path: blockPath };
      };

      return {
        anchor: findPoint(matchStart),
        focus: findPoint(matchEnd, true),
      };
    },
  }),
  effectTypes: [aiBatchEffect, aiPreviewField.effect],
  stateFields: [aiBatchField, aiPreviewField],
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
  update: ({ context, editor, key, tx }) => {
    const getPreviewRange = (
      children: readonly Descendant[]
    ):
      | { kind: 'invalid' }
      | { kind: 'none' }
      | { end: number; kind: 'range'; start: number } => {
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
    const cancelPreview = () => {
      const preview = tx.getField(aiPreviewField);

      if (!preview) return false;

      tx.history.skip();
      tx.selection.set(null);

      const range = getPreviewRange(tx.children());

      if (range.kind === 'invalid') return false;

      if (range.kind === 'range') {
        tx.nodes.replaceChildren(cloneDeep(preview.originalBlocks), {
          at: [],
          count: range.end - range.start + 1,
          index: range.start,
        });
      }

      const aiChat = editor.plugin(PLUGINS.aiChat);

      tx.nodes.remove({
        at: [],
        match: { type: aiChat.type },
      });

      tx.setField(aiPreviewField, null);
      context.afterCommit(() => {
        if (!preview.selectionBefore) return;

        editor
          .update({ history: 'skip' })
          .selection.set(cloneDeep(preview.selectionBefore));
      });

      return true;
    };

    return {
      acceptPreview: () => {
        const preview = tx.getField(aiPreviewField);

        if (!preview) return false;

        const range = getPreviewRange(tx.children());

        if (range.kind === 'invalid') return false;
        if (range.kind === 'none') return cancelPreview();

        function stripNode(node: Descendant): Descendant {
          if (ElementApi.isElement(node)) return stripElement(node);

          const rest = { ...node };

          Reflect.deleteProperty(rest, key);

          return rest;
        }
        function stripElement(node: Element): Element {
          const { [AI_PREVIEW_KEY]: _preview, children, ...rest } = node;

          return {
            ...rest,
            children: children.map(stripNode),
          };
        }
        const acceptedBlocks = cloneDeep(
          tx.children().slice(range.start, range.end + 1)
        ).map((block) => {
          if (!ElementApi.isElement(block)) {
            throw new Error('AI preview roots must be elements');
          }

          return stripElement(block);
        });

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
            [key]: true,
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
        tx.nodes.unset(key, {
          at,
          match: (node) => Boolean(Reflect.get(node, key)),
        });
      },
      removeNodes: ({ at = [] }: { at?: Path } = {}) => {
        tx.nodes.remove({
          at,
          match: (node) =>
            !ElementApi.isElement(node) && Boolean(Reflect.get(node, key)),
        });
      },
      undo: () => {
        if (tx.getField(aiPreviewField)) return cancelPreview();

        const hasAINodeOrAISuggestion =
          tx.nodes.some({
            at: [],
            match: (node) => Boolean(Reflect.get(node, key)),
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

export type BaseAIDefinition = DefinitionOf<typeof BaseAIPlugin>;
