import { distance } from 'fastest-levenshtein';

import {
  defineBasePlugin,
  type DefinitionOf,
  type NodeEntry,
  type Path,
  PLUGINS,
  property,
  type Range,
  NodeApi,
  target,
} from '../../core';

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
      const textSegments: Array<{ offset: number; path: Path; text: string }> =
        [];
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
  render: { isDecoration: false },
  rules: { selection: { affinity: 'outward' } },
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
  },
});

export type BaseAIDefinition = DefinitionOf<typeof BaseAIPlugin>;
