import type { RootKey } from '@platejs/plite';

import {
  type Editor as RuntimeEditor,
  withEditorUpdateRootScope,
} from './runtime-editor-api';

export const withProjectedMutationRoot = <T>(
  editor: RuntimeEditor,
  root: RootKey | undefined,
  fn: () => T
): T => withEditorUpdateRootScope(editor, root, fn);
