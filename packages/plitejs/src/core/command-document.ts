import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  Selection,
} from '../interfaces/editor';
import type { DocumentChange } from './change/document-change';
import type { RootChange } from './change/root-change';
import { getEditorRuntimeOwner } from './editor-runtime';

/**
 * The document an editing command decides on, when it differs from the stored
 * one: `project` returns that document and the change from the stored value
 * to it, or `null` when they are the same. The document is frozen, as the
 * stored one is.
 *
 * @internal
 */
export type EditorCommandDocument = Readonly<{
  /**
   * Runs once a frame's recording commits, with what the frame's commands
   * wrote and the stored document and selection the recording left, both
   * through the canonical pass, so a test build can check one against the
   * other.
   */
  checkRecorded?: (input: EditorFrameRecording) => void;
  project: (value: EditorDocumentValue) => Readonly<{
    change: DocumentChange;
    carried?: Readonly<{
      change: RootChange;
      from: EditorDocumentValue['children'];
    }>;
    value: EditorDocumentValue;
  }> | null;
}>;

/** @internal */
export type EditorFrameRecording = Readonly<{
  frame: EditorDocumentState;
  root: string;
  stored: EditorDocumentState;
}>;

/** @internal */
export type EditorDocumentState = Readonly<{
  selection: Selection;
  value: EditorDocumentValue;
}>;

const COMMAND_DOCUMENTS = new WeakMap<object, EditorCommandDocument>();

/** @internal */
export const registerEditorCommandDocument = (
  editor: Editor,
  document: EditorCommandDocument
) => {
  const owner = getEditorRuntimeOwner(editor);

  if (COMMAND_DOCUMENTS.has(owner)) {
    throw new Error('An editor accepts one command document.');
  }
  COMMAND_DOCUMENTS.set(owner, document);

  return () => {
    if (COMMAND_DOCUMENTS.get(owner) === document) {
      COMMAND_DOCUMENTS.delete(owner);
    }
  };
};

/** @internal */
export const getEditorCommandDocument = (editor: Editor) =>
  COMMAND_DOCUMENTS.get(getEditorRuntimeOwner(editor));
