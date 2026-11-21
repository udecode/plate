import {
  defineUpdateAnnotation,
  type EditorUpdateAnnotation,
  type Node,
  NodeApi,
  type NodeKey,
  type Path,
  type Point,
  type Range,
  RangeApi,
} from '../..';
import { getRemovableTripleClickedBlock } from '../../core/editor-commands';
import { getSelection } from '../../dom';
import { type DOMPhaseScheduler, EDITOR_TO_ELEMENT } from '../../dom/internal';
import { resolveWrittenDOMRange } from '../../dom/plugin/dom-editor';
import {
  getDOMRangeSelectionPoints,
  writeDOMSelection,
} from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { EditableInputController } from './input-controller';
import { getInnerLineRange } from './line-boundary';
import {
  type AnyEditor,
  above as editorAbove,
  isBlock as editorIsBlock,
  range as editorRange,
} from './runtime-editor-api';

export const tripleClickedBlock = defineUpdateAnnotation<NodeKey>({
  key: 'selection.triple-clicked-block',
});

export const readSelectionAnnotation = <TValue>(
  editor: AnyEditor,
  annotation: EditorUpdateAnnotation<TValue>,
  selection: Range
) => {
  const commit = editor.read.lastCommit();
  const value = commit?.annotations[annotation.key] as TValue | undefined;

  return value !== undefined &&
    RangeApi.isRange(commit?.selectionAfter) &&
    RangeApi.equals(commit.selectionAfter, selection)
    ? value
    : null;
};

export const readTripleClickedBlock = (editor: AnyEditor, selection: Range) =>
  readSelectionAnnotation(editor, tripleClickedBlock, selection);

export const getTripleClickRange = (
  editor: ReactRuntimeEditor,
  [node, path]: readonly [Node, Path],
  point: Point | null
) => {
  const blockEntry =
    NodeApi.isElement(node) && editorIsBlock(editor, node)
      ? ([node, path] as const)
      : editorAbove(editor, {
          at: path,
          match: (n) => NodeApi.isElement(n) && editorIsBlock(editor, n),
        });
  const blockPath = blockEntry?.[1] ?? path.slice(0, 1);
  const lineRange =
    blockEntry && point ? getInnerLineRange(editor, blockEntry, point) : null;

  if (lineRange) return { block: null, range: lineRange };

  const range = editorRange(editor, blockPath);
  const block = editor.read((state) =>
    getRemovableTripleClickedBlock(state, range)
  );

  return { block, range };
};

export const exportTripleClickSelectionToDOM = ({
  domPhaseScheduler,
  editor,
  inputController,
  range,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  range: Range;
}) => {
  const editorElement = EDITOR_TO_ELEMENT.get(editor);

  if (!editorElement) {
    return;
  }

  const domRange = resolveWrittenDOMRange(editor, range);

  if (!domRange) {
    return;
  }

  const root = editorElement.getRootNode() as Document | ShadowRoot;

  if (!getSelection(root)) {
    return;
  }

  inputController.state.isUpdatingSelection = true;
  inputController.state.selectionChangeOrigin = 'programmatic-export';

  writeDOMSelection(
    root,
    getDOMRangeSelectionPoints(domRange, RangeApi.isBackward(range))
  );

  editorElement.ownerDocument.dispatchEvent(
    new Event('selectionchange', { bubbles: true })
  );
  const resetUpdatingSelection = () => {
    inputController.state.isUpdatingSelection = false;
  };

  domPhaseScheduler.schedule(
    'selection-repair',
    'triple-click-selection-settle',
    resetUpdatingSelection,
    { timing: 'timeout' }
  );
};
