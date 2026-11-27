import {
  type Node,
  NodeApi,
  type Path,
  type Point,
  type Range,
  RangeApi,
} from '../..';
import { getSelection } from '../../dom';
import {
  canWriteEditableDOMSelection,
  type DOMPhaseScheduler,
  EDITOR_TO_ELEMENT,
} from '../../dom/internal';
import { resolveWrittenDOMRange } from '../../dom/plugin/dom-editor';
import { getDOMRangeSelectionPoints } from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { EditableInputController } from './input-controller';
import {
  beginEditableSelectionUpdate,
  endEditableSelectionUpdate,
  exportEditableDOMSelection,
} from './input-state';
import { getInnerLineRange } from './line-boundary';
import {
  above as editorAbove,
  isBlock as editorIsBlock,
  range as editorRange,
} from './runtime-editor-api';

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

  return {
    block: editor.read((state) => state.key(blockPath)),
    range: editorRange(editor, blockPath),
  };
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

  if (!canWriteEditableDOMSelection(editorElement, { editor })) {
    return;
  }

  let activeVersion: number | undefined;
  const exported = exportEditableDOMSelection(
    inputController.state,
    editorElement,
    getDOMRangeSelectionPoints(domRange, RangeApi.isBackward(range)),
    {
      editor,
      onExport: (version) => {
        activeVersion = version;
      },
    }
  );

  if (!exported) {
    return;
  }

  const settleVersion =
    activeVersion ?? beginEditableSelectionUpdate(inputController.state);

  editorElement.ownerDocument.dispatchEvent(
    new Event('selectionchange', { bubbles: true })
  );
  domPhaseScheduler.schedule(
    'selection-repair',
    'triple-click-selection-settle',
    () => {
      endEditableSelectionUpdate(inputController.state, settleVersion);
    },
    { timing: 'timeout' }
  );
};
