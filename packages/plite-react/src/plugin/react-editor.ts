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
    clipboard: DOMClipboardApi;
    dom: DOMApi;
    react: ReactApi;
  };
}

export interface ReactEditorInterface extends DOMEditorInterface {}

export const ReactEditor: ReactEditorInterface = DOMEditor;

// React owns DOM capability through api.dom and weak maps. Keep the structural
// cast at this boundary while DOMEditor helpers still require a root dom field.
export const toReactRuntimeEditor = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: unknown
): ReactRuntimeEditor<V, TExtensions> =>
  editor as ReactRuntimeEditor<V, TExtensions>;
