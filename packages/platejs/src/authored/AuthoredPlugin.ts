import {
  authored,
  authoredRecords,
  type AuthoredPlugin as NativeAuthoredPlugin,
} from 'plitejs/authored';

import { definePlugin } from '../core';
import { readEditorAuthor } from '../lib/editor/editorUser.internal';
import type { InternalBasePluginRuntimeExtension } from '../lib/plugin/BasePlugin';
import type { InternalPluginDefinitionOf } from '../lib/plugin/pluginDefinitionLookup.internal';

const BaseAuthoredPlugin = definePlugin('authored', {
  dependencies: [authoredRecords],
});

/**
 * Suggestions attributed to the editor's user, or to the local user when the
 * editor has no `userId`.
 */
// The package declaration build cannot print the inferred `.extend()` type,
// which inlines Plite's private plugin brand (TS4094), so this annotation names
// its parts. Delete it once that build passes without it.
export const AuthoredPlugin: InternalBasePluginRuntimeExtension<
  typeof BaseAuthoredPlugin,
  InternalPluginDefinitionOf<typeof BaseAuthoredPlugin>,
  NativeAuthoredPlugin
> = BaseAuthoredPlugin.extend(({ editor }) =>
  authored({ authorId: () => readEditorAuthor(editor) })
);
