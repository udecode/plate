import type { RootKey } from '../..';
import {
  type Editor as RuntimeEditor,
  withEditorUpdateRootScope,
} from './runtime-editor-api';

export const withProjectedMutationRoot = <T>(
  editor: RuntimeEditor,
  root: RootKey | undefined,
  fn: () => T
): T => withEditorUpdateRootScope(editor, root, fn);
