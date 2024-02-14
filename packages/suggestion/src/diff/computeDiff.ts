import { nanoid, PlateEditor, TDescendant, Value } from '@udecode/plate-common';

import { getSuggestionProps } from '../transforms';
import { transformDiffDescendants } from './internal/transforms/transformDiffDescendants';
import { dmp } from './internal/utils/dmp';
import { StringCharMapping } from './internal/utils/string-char-mapping';

export interface ComputeDiffOptions {
  isInline: PlateEditor['isInline'];
  ignoreProps?: string[];
  getInsertProps: (node: TDescendant) => any;
  getRemoveProps: (node: TDescendant) => any;
  getUpdateProps: (node: TDescendant, oldProps: any, newProps: any) => any;
}

export function computeDiff(
  doc0: TDescendant[],
  doc1: TDescendant[],
  { ignoreProps, getUpdateProps, ...options }: ComputeDiffOptions
): TDescendant[] {
  const stringCharMapping = new StringCharMapping();

  const m0 = stringCharMapping.nodesToString(doc0);
  const m1 = stringCharMapping.nodesToString(doc1);

  const diff = dmp.diff_main(m0, m1);

  return transformDiffDescendants(diff, {
    ...options,
    ignoreProps,
    getUpdateProps: (node, oldProps, newProps) => {
      // Ignore the update if only ignored props have changed
      if (
        ignoreProps &&
        Object.keys(newProps).every((key) => ignoreProps.includes(key))
      )
        return {};

      return getUpdateProps(node, oldProps, newProps);
    },
    stringCharMapping,
  });
}

export function diffToSuggestions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  doc0: TDescendant[],
  doc1: TDescendant[],
  {
    isInline = editor.isInline,
    getInsertProps = () => getSuggestionProps(editor, nanoid()),
    getRemoveProps = () =>
      getSuggestionProps(editor, nanoid(), {
        suggestionDeletion: true,
      }),
    getUpdateProps = (_node, _oldProps, newProps) =>
      getSuggestionProps(editor, nanoid(), {
        suggestionUpdate: newProps,
      }),
    ...options
  }: Partial<ComputeDiffOptions> = {}
): V {
  return computeDiff(doc0, doc1, {
    isInline,
    getInsertProps,
    getRemoveProps,
    getUpdateProps,
    ...options,
  }) as V;
}
