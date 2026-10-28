import { withoutUnheldDefaults } from '../core/default-storage';
import { getEditorSchema } from '../core/editor-runtime';
import { getCompiledEditorSchemaFromApi } from '../core/editor-schema';
import { toCompiledNodeContext } from '../core/schema-compiler';
import {
  type Descendant,
  NodeApi,
  type Path,
  type Range,
  type Text,
} from '../interfaces';
import type { AnyEditor as EditorType } from '../interfaces/editor';

export type TextMarks = Record<string, unknown>;

export const withoutUnheldDefaultsBeside = <P extends TextMarks>(
  editor: EditorType,
  marks: P,
  path: Path,
  root: string
): P =>
  withoutUnheldDefaults(
    getCompiledEditorSchemaFromApi(getEditorSchema(editor)),
    marks,
    () =>
      toCompiledNodeContext(
        { text: '' },
        Array.from(
          NodeApi.ancestors(editor, path, { reverse: true }),
          ([ancestor]) => ancestor
        ).filter(NodeApi.isElement),
        root
      )
  );

const getTextMarks = (node: Text): TextMarks => {
  const { text: _text, ...marks } = node;

  return marks;
};

const getStableMarksKey = (marks: TextMarks) =>
  JSON.stringify(
    Object.keys(marks)
      .sort()
      .map((key) => [key, marks[key]])
  );

const collectNonEmptyTextMarks = (
  nodes: readonly Descendant[],
  marks: TextMarks[]
) => {
  for (const node of nodes) {
    if (NodeApi.isText(node)) {
      if (node.text.length > 0) {
        marks.push(getTextMarks(node));
      }
      continue;
    }

    collectNonEmptyTextMarks(node.children, marks);
  }
};

export const getConsistentRangeTextMarks = (
  editor: EditorType,
  range: Range
): TextMarks | null => {
  const textMarks: TextMarks[] = [];
  collectNonEmptyTextMarks(NodeApi.fragment(editor, range), textMarks);

  const [first] = textMarks;
  if (!first || Object.keys(first).length === 0) {
    return null;
  }

  const firstKey = getStableMarksKey(first);

  return textMarks.every((marks) => getStableMarksKey(marks) === firstKey)
    ? first
    : null;
};
