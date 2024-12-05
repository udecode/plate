import type { AnyObject } from '@udecode/utils';
import type { Path, Range, RangeRef } from 'slate';

import {
  type TEditor,
  createRangeRef,
  getNode,
  getNodeTexts,
} from '@udecode/slate';

export type ParseNodeOptions = {
  /** Function to match tokens and return match result */
  match: (params: {
    end: number;
    fullText: string;
    getContext: (options: { after?: number; before?: number }) => string;
    start: number;
    text: string;
  }) => AnyObject | boolean;
  /** Base path to the current node */
  at: Path;
  /** Maximum length of tokens to process */
  maxLength?: number;
  /** Minimum length of tokens to process */
  minLength?: number;
  /** Pattern for matching tokens in text */
  splitPattern?: RegExp;
  /** Function to transform matched tokens */
  transform?: (token: TokenMatch) => TokenMatch;
};

export type ParseNodeResult = {
  // All decorations for rendering
  decorations: TokenDecoration[];
  tokens: TokenMatch[];
};

export type TokenDecoration = {
  // The token that was matched
  token: {
    // The full range of the token
    range: Range;
    // The full range reference of the token
    rangeRef: RangeRef;
    // The text of the token
    text: string;
  };
  // The range of the token that was matched. There can be multiple leaves that make up the token.
  range: Range;
};

export type TokenMatch = {
  range: Range;
  rangeRef: RangeRef;
  text: string;
};

export const experimental_parseNode = (
  editor: TEditor,
  options: ParseNodeOptions
): ParseNodeResult => {
  const node = getNode(editor, options.at);

  if (!node) return { decorations: [], tokens: [] };

  const texts = [...getNodeTexts(node)];
  const fullText = texts.map((text) => text[0].text).join('');

  const createContextGetter = (start: number, end: number) => {
    return ({ after = 0, before = 0 }) => {
      const beforeText = fullText.slice(Math.max(0, start - before), start);
      const afterText = fullText.slice(
        end,
        Math.min(fullText.length, end + after)
      );

      return beforeText + afterText;
    };
  };

  // Process matches
  const splitPattern = options.splitPattern ?? /\b[\dA-Za-z]+(?:['-]\w+)*\b/g;
  const matches = Array.from(fullText.matchAll(splitPattern));

  const tokenDecorations: TokenDecoration[] = [];
  const uniqueTokens = new Map<string, TokenMatch>();

  matches.forEach((match) => {
    const tokenText = match[0];
    const start = match.index!;
    const end = start + tokenText.length;

    // Skip tokens that don't meet length requirements
    if (
      tokenText.length < (options.minLength ?? 0) ||
      tokenText.length > (options.maxLength ?? Infinity)
    ) {
      return;
    }

    const matchResult = options.match({
      end,
      fullText,
      getContext: createContextGetter(start, end),
      start,
      text: tokenText,
    });

    if (matchResult) {
      let startPath: Path | null = null;
      let endPath: Path | null = null;
      let startOffset = 0;
      let endOffset = 0;
      let cumulativeLength = 0;

      // Find the correct start and end positions across leaves
      for (const [text, path] of texts) {
        const textLength = text.text.length;
        const textEnd = cumulativeLength + textLength;

        // Find start position
        if (startPath === null && start < textEnd) {
          startPath = [...options.at, ...path];
          startOffset = start - cumulativeLength;
        }
        // Find end position
        if (endPath === null && end <= textEnd) {
          endPath = [...options.at, ...path];
          endOffset = end - cumulativeLength;
        }
        if (startPath !== null && endPath !== null) break;

        cumulativeLength = textEnd;
      }

      if (startPath && endPath) {
        const tokenRange = {
          anchor: { offset: startOffset, path: startPath },
          focus: { offset: endOffset, path: endPath },
        };
        const tokenRangeRef = createRangeRef(editor, tokenRange);

        let token = {
          range: tokenRange,
          rangeRef: tokenRangeRef,
          text: tokenText,
        };

        if (options.transform) {
          token = options.transform(token);
        }

        // Store unique token
        const tokenKey = `${tokenRange.anchor.path.join('-')}-${tokenRange.anchor.offset}-${tokenRange.focus.offset}`;

        if (!uniqueTokens.has(tokenKey)) {
          uniqueTokens.set(tokenKey, token);
        }

        // Create decorations
        cumulativeLength = 0;

        for (const [text, path] of texts) {
          const textPath = [...options.at, ...path];
          const textStart = cumulativeLength;
          const textEnd = textStart + text.text.length;

          if (start >= textEnd) {
            cumulativeLength = textEnd;

            continue;
          }
          if (end <= textStart) break;

          const overlapStart = Math.max(start, textStart);
          const overlapEnd = Math.min(end, textEnd);

          if (overlapStart < overlapEnd) {
            tokenDecorations.push({
              range: {
                anchor: {
                  offset: overlapStart - textStart,
                  path: textPath,
                },
                focus: {
                  offset: overlapEnd - textStart,
                  path: textPath,
                },
              },
              token,
            });
          }

          cumulativeLength = textEnd;
        }
      }
    }
  });

  return {
    decorations: tokenDecorations,
    tokens: Array.from(uniqueTokens.values()),
  };
};

// const DEFAULT_PATTERNS = {
//   word: /\b[a-zA-Z0-9]+(?:[''-]\w+)*\b/g,
//   phrase: /\b[a-zA-Z0-9]+(?:[''-]\w+)*(?:\s+[a-zA-Z0-9]+(?:[''-]\w+)*){1,5}\b/g,
//   sentence: /[^.!?]+[.!?]+/g,
//   paragraph: /[^\n\r]+/g,
// } as const;
