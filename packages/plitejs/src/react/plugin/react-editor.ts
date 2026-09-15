import type { Value } from '../..';
import type { DOMApi, DOMClipboardApi } from '../../dom';
import { DOMEditor, type DOMEditorInterface } from '../../dom/internal';
import type { ReactApi } from './with-react';

/**
 * A React and DOM-specific version of the `Editor` interface.
 */

export interface ReactRuntimeEditor<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = any,
> extends DOMEditor<V, TPlugins> {
  api: DOMEditor<V, TPlugins>['api'] & {
    dom: DOMApi & { clipboard: DOMClipboardApi };
    react: ReactApi;
  };
}

export interface ReactEditorInterface extends DOMEditorInterface {}

export const ReactEditor: ReactEditorInterface = DOMEditor;

export const toReactRuntimeEditor = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = any,
>(
  editor: DOMEditor<V, TPlugins>
): ReactRuntimeEditor<V, TPlugins> => editor as ReactRuntimeEditor<V, TPlugins>;
