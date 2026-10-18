import type {
  AnyEditor as Editor,
  EditorDocumentValue,
  Selection,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
} from './change/document-change';
import type { DocumentIndex } from './change/document-index';
import {
  mapRootChangePositionBackward,
  type RootChange,
} from './change/root-change';
import { getEditorRuntimeOwner } from './editor-runtime';
import { countCoreWork } from './work';

/**
 * How positions of the stored document correspond to positions of the
 * document commands decide on. A root the projection leaves alone maps each
 * position to itself.
 *
 * @internal
 */
export type CommandProjectionMap = Readonly<{
  /**
   * The projected span of content the projection inserts that strictly holds
   * a projected position, or `null`.
   */
  added: (
    root: string,
    position: number
  ) => Readonly<{ from: number; to: number }> | null;
  /**
   * The change from the stored document to the projected one. Work on it
   * costs the whole document, so each read is counted.
   */
  change: () => DocumentChange;
  /** Whether a stored position lies strictly inside content the projection removes. */
  hides: (root: string, position: number) => boolean;
  /** The roots the projection changes. */
  roots: readonly string[];
  /**
   * The projected position of a stored one. `association` picks the side of
   * content the projection puts there, as `DocumentChange.mapPosition` does.
   */
  toProjected: (
    root: string,
    position: number,
    association: 'backward' | 'forward'
  ) => number | null;
  /**
   * The stored position of a projected one. `assoc` picks the stored edge of
   * content the projection removed there.
   */
  toStored: (root: string, position: number, assoc: -1 | 1) => number | null;
}>;

/** @internal */
export type CommandProjection = Readonly<{
  /**
   * Each previous projected root and the change from it to this one's
   * root, when the projector derived one from the other.
   */
  carried?: ReadonlyMap<
    string,
    Readonly<{
      change: RootChange;
      from: DocumentIndex;
    }>
  >;
  /** The projected document's index of each root `map` changes. */
  indexes: ReadonlyMap<string, DocumentIndex>;
  map: CommandProjectionMap;
  /** Frozen, as the stored document is. */
  value: EditorDocumentValue;
}>;

/**
 * The document an editing command decides on, when it differs from the stored
 * one: `project` returns that document and how its positions map to the
 * stored one's, or `null` when they are the same.
 *
 * @internal
 */
export type EditorCommandDocument = Readonly<{
  /**
   * Runs once a frame's recording commits, with what the frame's commands
   * wrote and the stored document and selection the recording left, both
   * through the canonical pass. The stored document projects to what the
   * commands wrote, so the command document may take one as the other; a
   * test build checks that they agree.
   */
  recorded?: (input: EditorFrameRecording) => void;
  project: (value: EditorDocumentValue) => CommandProjection | null;
  unplaced?: () => Error;
}>;

/** @internal */
export type EditorFrameRecording = Readonly<{
  /** The commands' change from `projection.value` to `frame.value`. */
  change: DocumentChange;
  frame: EditorDocumentState;
  /** The document the commands decided on. */
  projection: CommandProjection;
  root: string;
  stored: EditorDocumentState;
}>;

/** @internal */
export type EditorDocumentState = Readonly<{
  selection: Selection;
  value: EditorDocumentValue;
}>;

/**
 * The projection map of `change`, the change from the stored document to the
 * projected one.
 *
 * @internal
 */
export const projectionMapOf = (change: DocumentChange): CommandProjectionMap =>
  Object.freeze({
    added: (root: string, position: number) => {
      const sections =
        getInternalDocumentRootChange(change, root)?.sections ?? [];
      let after = 0;

      for (let pair = 0; pair < sections.length; pair += 2) {
        countCoreWork('sectionsWalked');

        const inserted = sections[pair + 1];
        const length = inserted < 0 ? sections[pair] : inserted;

        if (inserted > 0 && after < position && position < after + length) {
          return { from: after, to: after + length };
        }
        after += length;
        if (after > position) return null;
      }

      return null;
    },
    change: () => {
      countCoreWork('projectionChanges');

      return change;
    },
    hides: (root: string, position: number) => {
      if (change.deleteRoots.has(root)) return true;

      const sections =
        getInternalDocumentRootChange(change, root)?.sections ?? [];
      let before = 0;

      for (let pair = 0; pair < sections.length; pair += 2) {
        countCoreWork('sectionsWalked');

        const length = sections[pair];

        if (
          sections[pair + 1] >= 0 &&
          before < position &&
          position < before + length
        ) {
          return true;
        }
        before += length;
        if (before > position) return false;
      }

      return false;
    },
    roots: Object.freeze(
      [...getInternalDocumentChangeEntries(change)].map(([root]) => root)
    ),
    toProjected: (root: string, position: number, association) => {
      if (change.deleteRoots.has(root)) return null;

      const rootChange = getInternalDocumentRootChange(change, root);

      return rootChange
        ? getDefined(
            rootChange.mapPos(position, association === 'forward' ? 1 : -1)
          )
        : position;
    },
    toStored: (root: string, position: number, assoc: -1 | 1) => {
      if (change.deleteRoots.has(root)) return null;

      const rootChange = getInternalDocumentRootChange(change, root);

      return rootChange
        ? getDefined(mapRootChangePositionBackward(rootChange, position, assoc))
        : position;
    },
  });

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

/** @internal */
export const unplacedIn = (editor: Editor, what: string) =>
  getEditorCommandDocument(editor)?.unplaced?.() ??
  new Error(`The command frame has no place for ${what}.`);
