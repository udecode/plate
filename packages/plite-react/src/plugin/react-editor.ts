import type { Value } from '@platejs/plite';
import type { DOMApi, DOMClipboardApi } from '@platejs/plite-dom';
import {
  DOMEditor,
  type DOMEditorInterface,
} from '@platejs/plite-dom/internal';
import type { ReactApi } from './with-react';

/**
 * A React and DOM-specific version of the `Editor` interface.
 */

export interface ReactRuntimeEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> extends DOMEditor<V, TExtensions> {
  api: DOMEditor<V, TExtensions>['api'] & {
    dom: DOMApi & { clipboard: DOMClipboardApi };
    react: ReactApi;
  };
}

export interface ReactEditorInterface extends DOMEditorInterface {}

export const ReactEditor: ReactEditorInterface = DOMEditor;

export const toReactRuntimeEditor = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: DOMEditor<V, TExtensions>
): ReactRuntimeEditor<V, TExtensions> =>
  editor as ReactRuntimeEditor<V, TExtensions>;
