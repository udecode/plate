import { type Editor, createEditor } from 'platejs';
import type { TestEditorFixture } from 'platejs/testing';

export {
  createDataTransfer,
  createHyperscript,
  elements,
  hjsx,
  jsx,
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
  type TestEditorFixture,
  voidChildren,
} from 'platejs/testing';

export const createEditorFromFixture = (fixture: TestEditorFixture): Editor =>
  createEditor({
    initialSelection: fixture.selection,
    ...(fixture.children.length > 0 ? { initialValue: fixture.children } : {}),
  });
