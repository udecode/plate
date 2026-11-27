import type { CodemodEdit } from './types';

export const applyCodemodEdits = (
  source: string,
  edits: readonly CodemodEdit[]
): string => {
  if (edits.length === 0) return source;

  const sorted = [...edits].sort((left, right) => {
    if (right.start !== left.start) return right.start - left.start;
    return right.end - left.end;
  });

  let previousStart = source.length + 1;
  let output = source;

  for (const edit of sorted) {
    if (
      edit.start < 0 ||
      edit.end < edit.start ||
      edit.end > source.length ||
      edit.end > previousStart
    ) {
      throw new Error(
        `Invalid or overlapping codemod edit [${edit.start}, ${edit.end}] against previous start ${previousStart}.`
      );
    }

    output =
      output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
    previousStart = edit.start;
  }

  return output;
};

export const lineStartOffset = (source: string, offset: number): number => {
  const previousNewline = source.lastIndexOf('\n', Math.max(0, offset - 1));

  return previousNewline === -1 ? 0 : previousNewline + 1;
};

export const lineIndentAt = (source: string, offset: number): string => {
  const start = lineStartOffset(source, offset);
  let cursor = start;

  while (
    cursor < source.length &&
    (source[cursor] === ' ' || source[cursor] === '\t')
  ) {
    cursor += 1;
  }

  return source.slice(start, cursor);
};

export const hasNearbyTodoTag = (
  source: string,
  insertOffset: number,
  tag: string
): boolean => {
  const windowStart = Math.max(0, insertOffset - 600);
  const preceding = source.slice(windowStart, insertOffset);

  return preceding.includes(tag);
};

export const buildTodoCommentEdit = (
  source: string,
  statementStart: number,
  inJsxChildren: boolean,
  code: string,
  message: string
): CodemodEdit | null => {
  const tag = `TODO(plate-codemod:${code})`;
  const insertOffset = inJsxChildren
    ? statementStart
    : lineStartOffset(source, statementStart);

  if (hasNearbyTodoTag(source, insertOffset, tag)) return null;

  const indent = lineIndentAt(source, statementStart);
  const replacement = inJsxChildren
    ? `{/* ${tag}: ${message} */}\n${indent}`
    : `${indent}// ${tag}: ${message}\n`;

  return {
    end: insertOffset,
    replacement,
    start: insertOffset,
  };
};
