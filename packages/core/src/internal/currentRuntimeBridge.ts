import {
  assignLegacyApi,
  assignLegacyTransforms,
  createEditor,
  syncLegacyMethods,
  withHistory,
  type Descendant,
  type DescendantIn,
  type Editor,
  type EditorApi,
  type EditorBase,
  type EditorTransforms,
  type Operation,
  type Value,
} from '@platejs/slate-legacy';

import { getStoredCurrentRuntimeTransforms } from './currentRuntimeTransformStore';

export type CurrentRuntimeDescendantIn<TValue extends Value> =
  DescendantIn<TValue>;
export type CurrentRuntimeEditor<TValue extends Value = Value> = Editor<TValue>;
export type CurrentRuntimeEditorApi<TValue extends Value = Value> =
  EditorApi<TValue> & {
    history: {
      isMerging: () => boolean | undefined;
      isSaving: () => boolean | undefined;
      withMerging: (fn: () => void) => void;
      withNewBatch: (fn: () => void) => void;
      withoutMerging: (fn: () => void) => void;
      withoutSaving: (fn: () => void) => void;
    };
    dom: {
      blur: () => void;
      deselect: () => void;
      focus: (options?: { retries?: number }) => void;
      resolveDOMNode: (node: unknown) => HTMLElement | null;
      resolveDOMRange: (range: unknown) => globalThis.Range | null;
      resolvePath: (node: unknown) => number[];
      resolveSlateNode: (domNode: globalThis.Node) => unknown;
    };
    clipboard: {
      insertData: (data: DataTransfer) => boolean;
      writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) => void;
    };
  };
export type CurrentRuntimeEditorBase<TValue extends Value = Value> =
  EditorBase<TValue>;
export type CurrentRuntimeEditorTransforms<TValue extends Value = Value> =
  EditorTransforms<TValue>;
export type CurrentRuntimeOperation<TNode extends Descendant = Descendant> =
  Operation<TNode>;

export type CurrentRuntimeTransformHost<TValue extends Value = Value> = {
  tf: CurrentRuntimeEditorTransforms<TValue>;
};

export const getCurrentRuntimeTransforms = <TValue extends Value = Value>(
  editor: unknown
) =>
  (editor as CurrentRuntimeTransformHost<TValue>).tf ??
  getStoredCurrentRuntimeTransforms<CurrentRuntimeEditorTransforms<TValue>>(
    editor
  );

export const assignCurrentRuntimeApi = <TValue extends Value = Value>(
  editor: unknown,
  api: EditorApi<TValue>
) => assignLegacyApi(editor as Editor, api as unknown as EditorApi);
export const assignCurrentRuntimeTransforms = <TValue extends Value = Value>(
  editor: unknown,
  transforms: Partial<EditorTransforms<TValue>>
) =>
  assignLegacyTransforms(
    editor as Editor,
    transforms as Partial<EditorTransforms>
  );
export const createCurrentRuntimeEditor = createEditor;
export const syncCurrentRuntimeMethods = (editor: unknown) =>
  syncLegacyMethods(editor as Editor);
export const withCurrentRuntimeHistory = withHistory;
