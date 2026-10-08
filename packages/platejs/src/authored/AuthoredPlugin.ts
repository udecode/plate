import {
  authored,
  type AuthoredPlugin as NativeAuthoredPlugin,
} from 'plitejs/authored';

import { definePlugin } from '../core';
import { readEditorAuthor } from '../lib/editor/editorUser.internal';
import type { InternalBasePluginRuntimeExtension } from '../lib/plugin/BasePlugin';
import type { InternalPluginDefinitionOf } from '../lib/plugin/pluginDefinitionLookup.internal';

const BaseAuthoredPlugin = definePlugin('authored', {
  initialState: { retainHistory: false },
});

/**
 * Native authored changes attributed to the editor's user, or to the local
 * user when the editor has no `userId`. Configure `retainHistory` to keep
 * accepted history for revert; the editor reads it once, when it is created.
 */
// The package declaration build cannot print the inferred `.extend()` type,
// which inlines Plite's private plugin brand (TS4094), so this annotation names
// its parts. Delete it once that build passes without it.
export const AuthoredPlugin: InternalBasePluginRuntimeExtension<
  typeof BaseAuthoredPlugin,
  InternalPluginDefinitionOf<typeof BaseAuthoredPlugin>,
  NativeAuthoredPlugin
> = BaseAuthoredPlugin.extend(({ editor, store }) =>
  authored({
    authorId: () => readEditorAuthor(editor),
    retainHistory: store.get('retainHistory'),
  })
);
