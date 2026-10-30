import { type Range, RangeApi } from '../..';
import { getSelection } from '../../dom';
import { type DOMPhaseScheduler, EDITOR_TO_ELEMENT } from '../../dom/internal';
import { resolveWrittenDOMRange } from '../../dom/plugin/dom-editor';
import {
  getDOMRangeSelectionPoints,
  writeDOMSelection,
} from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { EditableInputController } from './input-controller';

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
