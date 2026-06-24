import type { Value } from '@platejs/plite';
import type { DOMApi, DOMClipboardApi } from '@platejs/plite-dom';
import {
  DOMEditor,
  type DOMEditorInterface,
} from '@platejs/plite-dom/internal';

/**
 * A React and DOM-specific version of the `Editor` interface.
 */

export interface ReactRuntimeEditor<V extends Value = Value>
  extends DOMEditor<V> {
  api: DOMEditor<V>['api'] & {
    clipboard: DOMClipboardApi;
    dom: DOMApi;
  };
}

export interface ReactEditorInterface extends DOMEditorInterface {}

export const ReactEditor: ReactEditorInterface = DOMEditor;
