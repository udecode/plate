import type { BaseEditor } from '@platejs/core';
import {
  type Descendant,
  type Element,
  ElementApi,
  TextApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { type ComputeDiffOptions, computeDiff } from '@platejs/diff';

import { BaseSuggestionPlugin } from './BaseSuggestionPlugin';

export function diffToSuggestions<E extends BaseEditor>(
  editor: E,
  doc0: readonly Element[],
  doc1: readonly Element[],
  options?: Partial<ComputeDiffOptions>
): Element[];
export function diffToSuggestions<E extends BaseEditor>(
  editor: E,
  doc0: readonly Descendant[],
  doc1: readonly Descendant[],
  options?: Partial<ComputeDiffOptions>
): Descendant[];
export function diffToSuggestions<E extends BaseEditor>(
  editor: E,
  doc0: readonly Descendant[],
  doc1: readonly Descendant[],
  {
    getDeleteProps = (node) =>
      editor.plugin(BaseSuggestionPlugin).api.getProps(node, {
        suggestionDeletion: true,
      }),
    getInsertProps = (node) =>
      editor.plugin(BaseSuggestionPlugin).api.getProps(node),
    getUpdateProps = (node, properties, newProperties) =>
      editor.plugin(BaseSuggestionPlugin).api.getProps(node, {
        suggestionUpdate: {
          newProperties: withoutUndefined(newProperties),
          properties: withoutUndefined(properties),
        },
      }),
    isInline = editor.read.schema.isInline,
    ...options
  }: Partial<ComputeDiffOptions> = {}
): Descendant[] {
  const values = computeDiff(doc0, doc1, {
    getDeleteProps,
    getInsertProps,
    getUpdateProps,
    isInline,
    ...options,
  });
  const api = editor.plugin(BaseSuggestionPlugin).api;

  const traverseNodes = (nodes: readonly Descendant[]): Descendant[] =>
    nodes.map((node, index) => {
      if (ElementApi.isElement(node) && 'children' in node) {
        return {
          ...node,
          children: traverseNodes(node.children),
        };
      }

      if (TextApi.isText(node) && node[KEYS.suggestion]) {
        const current = api.suggestionData(node);
        const previous = index > 0 ? nodes[index - 1] : undefined;
        const previousData =
          previous && Boolean(previous[KEYS.suggestion])
            ? api.suggestionData(previous)
            : undefined;

        if (current?.type === 'insert' && previousData?.type === 'remove') {
          const updatedNode = {
            ...node,
            [api.key(previousData.id)]: {
              ...current,
              id: previousData.id,
              createdAt: previousData.createdAt,
            },
          };

          delete updatedNode[api.key(current.id)];

          return updatedNode;
        }
      }

      return node;
    });

  return traverseNodes(values);
}

const withoutUndefined = (properties: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
