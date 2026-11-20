import type { EditorCommit } from '../../../core';
import { BaseFieldPlugin, type FieldRead } from '../../../features/field/lib';
import { toReactPlugin, useEditorSelector } from '../../core';

/** The field plugin for a React editor. */
export const FieldPlugin = toReactPlugin(BaseFieldPlugin);

const elementsChanged = (commit?: EditorCommit) =>
  !commit ||
  commit.changed.hasAny('properties') ||
  commit.changed.hasAny('structure');

const sameRead = (a: FieldRead | null, b: FieldRead | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.node === b.node &&
    a.problems.length === b.problems.length &&
    a.problems.every((problem, index) => problem === b.problems[index]));

/**
 * Read the field with this id and its problems. A commit that changes an
 * element rereads it, and the caller renders again only when the field or its
 * problems changed, such as when the field its condition names is deleted.
 */
export const useFieldRead = (fieldId: string) =>
  useEditorSelector(
    (editor) => editor.plugin(BaseFieldPlugin).read.field(fieldId),
    { equalityFn: sameRead, shouldUpdate: elementsChanged }
  );
