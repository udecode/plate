import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import {
  ElementApi,
  NodeApi,
  type DecoratedRange,
  type NodeEntry,
  type Text,
  TextApi,
  property,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export type FindReplacePluginState = {
  /** Searching text to highlight */
  search: string;
};

const initialState: FindReplacePluginState = {
  search: '',
};

export const FindReplacePlugin = defineBasePlugin(PLUGINS.searchHighlight, {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  initialState,
  decorate: ({ editor, entry: [node, path], schema, store }) => {
    const { search } = store.get();

    if (
      !(search && ElementApi.isElement(node) && editor.read.nodes.isBlock(node))
    ) {
      return [];
    }

    const textEntries: Array<NodeEntry<Text>> = [];

    for (const [index, child] of node.children.entries()) {
      if (TextApi.isText(child)) {
        textEntries.push([child, [index]]);
      } else if (
        ElementApi.isElement(child) &&
        editor.read.schema.isInline(child)
      ) {
        for (const [text, relativePath] of NodeApi.texts(child)) {
          textEntries.push([text, [index, ...relativePath]]);
        }
      }
    }
    const str = textEntries
      .map(([text]) => text.text)
      .join('')
      .toLowerCase();
    const searchLower = search.toLowerCase();

    let start = 0;
    const matches: number[] = [];

    while (true) {
      start = str.indexOf(searchLower, start);

      if (start === -1) break;

      matches.push(start);
      start += searchLower.length;
    }

    if (matches.length === 0) {
      return [];
    }

    const ranges: Array<
      DecoratedRange & {
        search: string;
        searchHighlight: boolean;
      }
    > = [];
    let cumulativePosition = 0;
    let matchIndex = 0;

    for (const [text, relativePath] of textEntries) {
      const textStart = cumulativePosition;
      const textEnd = textStart + text.text.length;

      while (matchIndex < matches.length && matches[matchIndex] < textEnd) {
        const matchStart = matches[matchIndex];
        const matchEnd = matchStart + search.length;

        if (matchEnd <= textStart) {
          matchIndex += 1;

          continue;
        }

        const overlapStart = Math.max(matchStart, textStart);
        const overlapEnd = Math.min(matchEnd, textEnd);

        if (overlapStart < overlapEnd) {
          const anchorOffset = overlapStart - textStart;
          const focusOffset = overlapEnd - textStart;
          const searchOverlapStart = overlapStart - matchStart;
          const searchOverlapEnd = overlapEnd - matchStart;
          const textNodePath = [...path, ...relativePath];

          ranges.push({
            anchor: {
              offset: anchorOffset,
              path: textNodePath,
            },
            focus: {
              offset: focusOffset,
              path: textNodePath,
            },
            search: search.slice(searchOverlapStart, searchOverlapEnd),
            [schema.key]: true,
          });
        }
        if (matchEnd <= textEnd) {
          matchIndex += 1;
        } else {
          break;
        }
      }

      cumulativePosition = textEnd;
    }

    return ranges;
  },
});

export type FindReplaceDefinition = DefinitionOf<typeof FindReplacePlugin>;
