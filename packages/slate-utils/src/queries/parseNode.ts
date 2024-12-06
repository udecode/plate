import type { AnyObject } from '@udecode/utils';
import type { Path, Range } from 'slate';

import {
  type TDescendant,
  type TEditor,
  type TElement,
  createRangeRef,
  getNode,
  getNodeTexts,
  isBlock,
  isEditor,
} from '@udecode/slate';

import type { Annotation } from './annotationToDecorations';

export type ParseNodeOptions = {
  /** Function to match annotations and return match result */
  match: (params: {
    end: number;
    fullText: string;
    getContext: (options: { after?: number; before?: number }) => string;
    start: number;
    text: string;
  }) => AnyObject | boolean;
  /** Target path or range. If undefined, parses entire editor */
  at?: Path | Range;
  /** Maximum length of annotations to process */
  maxLength?: number;
  /** Minimum length of annotations to process */
  minLength?: number;
  /** Pattern for matching annotations in text */
  splitPattern?: RegExp;
  /** Function to transform matched annotations */
  transform?: (annotation: Annotation) => Annotation;
};

export type ParseNodeResult = {
  annotations: Annotation[];
};

export const experimental_parseNode = (
  editor: TEditor,
  options: ParseNodeOptions
): ParseNodeResult => {
  if (!options.at) {
    options.at = [];
  }

  // Get target path
  const at: Path = Array.isArray(options.at)
    ? options.at
    : options.at.anchor.path;
  const node = getNode(editor, at);

  if (!node) return { annotations: [] };
  // If node is editor or block and path is not leaf, parse children
  if ((isEditor(node) || isBlock(editor, node)) && at.length === 0) {
    const element = node as TElement;
    const results = element.children.flatMap(
      (child: TDescendant, index: number) => {
        if (!isBlock(editor, child)) return [];

        return experimental_parseNode(editor, {
          ...options,
          at: [...at, index],
        });
      }
    );

    return {
      annotations: results.flatMap((r: ParseNodeResult) => r.annotations),
    };
  }

  // Parse single block
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

  const uniqueAnnotations = new Map<string, Annotation>();

  matches.forEach((match) => {
    const annotationText = match[0];
    const start = match.index!;
    const end = start + annotationText.length;

    // Skip annotations that don't meet length requirements
    if (
      annotationText.length < (options.minLength ?? 0) ||
      annotationText.length > (options.maxLength ?? Infinity)
    ) {
      return;
    }

    // Apply match function
    const matchResult = options.match({
      end,
      fullText,
      getContext: createContextGetter(start, end),
      start,
      text: annotationText,
    });

    // Skip if match function returns false
    if (!matchResult) {
      return;
    }

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
        startPath = [...at, ...path];
        startOffset = start - cumulativeLength;
      }
      // Find end position
      if (endPath === null && end <= textEnd) {
        endPath = [...at, ...path];
        endOffset = end - cumulativeLength;
      }
      if (startPath !== null && endPath !== null) break;

      cumulativeLength = textEnd;
    }

    if (startPath && endPath) {
      const annotationRange = {
        anchor: { offset: startOffset, path: startPath },
        focus: { offset: endOffset, path: endPath },
      };
      const annotationRangeRef = createRangeRef(editor, annotationRange);

      let annotation = {
        range: annotationRange,
        rangeRef: annotationRangeRef,
        text: annotationText,
      };

      if (options.transform) {
        annotation = options.transform(annotation);
      }

      // Store unique annotation
      const annotationKey = `${annotationRange.anchor.path.join('-')}-${annotationRange.anchor.offset}-${annotationRange.focus.offset}`;

      if (!uniqueAnnotations.has(annotationKey)) {
        uniqueAnnotations.set(annotationKey, annotation);
      }
    }
  });

  return {
    annotations: Array.from(uniqueAnnotations.values()),
  };
};

// const DEFAULT_PATTERNS = {
//   word: /\b[a-zA-Z0-9]+(?:[''-]\w+)*\b/g,
//   phrase: /\b[a-zA-Z0-9]+(?:[''-]\w+)*(?:\s+[a-zA-Z0-9]+(?:[''-]\w+)*){1,5}\b/g,
//   sentence: /[^.!?]+[.!?]+/g,
//   paragraph: /[^\n\r]+/g,
// } as const;
