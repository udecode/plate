import type { AnyObject } from '@udecode/utils';
import type { Path, Range, RangeRef } from 'slate';

import {
  type TEditor,
  createRangeRef,
  getNode,
  getNodeTexts,
} from '@udecode/slate';

export type ParseNodeOptions = {
  /** Base path to the current node */
  at: Path;
  /** Function to match tokens and return match result */
  match: (token: string) => AnyObject | boolean;
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
  {
    at,
    match: matchToken,
    maxLength = Infinity,
    minLength = 0,
    splitPattern = /\b[\dA-Za-z]+(?:['-]\w+)*\b/g,
    transform,
  }: ParseNodeOptions
): ParseNodeResult => {
  const node = getNode(editor, at);

  if (!node) return { decorations: [], tokens: [] };

  const texts = [...getNodeTexts(node)];
  const str = texts.map((text) => text[0].text).join('');
  const tokenDecorations: TokenDecoration[] = [];
  const uniqueTokens = new Map<string, TokenMatch>();

  let matchResult: RegExpExecArray | null = null;

  while ((matchResult = splitPattern.exec(str)) !== null) {
    const tokenText = matchResult[0];

    // Skip tokens that don't meet length requirements
    if (tokenText.length < minLength || tokenText.length > maxLength) {
      continue;
    }

    const tokenStart = matchResult.index;
    const tokenEnd = tokenStart + tokenText.length;
    const tokenData = matchToken(tokenText);

    if (tokenData) {
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
        if (startPath === null && tokenStart < textEnd) {
          startPath = [...at, ...path];
          startOffset = tokenStart - cumulativeLength;
        }
        // Find end position
        if (endPath === null && tokenEnd <= textEnd) {
          endPath = [...at, ...path];
          endOffset = tokenEnd - cumulativeLength;
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

        if (transform) {
          token = transform(token);
        }

        // Store unique token
        const tokenKey = `${tokenRange.anchor.path.join('-')}-${tokenRange.anchor.offset}-${tokenRange.focus.offset}`;

        if (!uniqueTokens.has(tokenKey)) {
          uniqueTokens.set(tokenKey, token);
        }

        // Create decorations
        cumulativeLength = 0;

        for (const [text, path] of texts) {
          const textPath = [...at, ...path];
          const textStart = cumulativeLength;
          const textEnd = textStart + text.text.length;

          if (tokenStart >= textEnd) {
            cumulativeLength = textEnd;

            continue;
          }
          if (tokenEnd <= textStart) break;

          const overlapStart = Math.max(tokenStart, textStart);
          const overlapEnd = Math.min(tokenEnd, textEnd);

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
  }

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
