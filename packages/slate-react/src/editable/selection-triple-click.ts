import { type Range, RangeApi } from '@platejs/slate';
import { getDefaultView, getSelection } from '@platejs/slate-dom';
import { EDITOR_TO_ELEMENT } from '@platejs/slate-dom/internal';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type { EditableInputController } from './input-controller';

export const exportTripleClickSelectionToDOM = ({
  editor,
  inputController,
  range,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  range: Range;
}) => {
  const editorElement = EDITOR_TO_ELEMENT.get(editor);

  if (!editorElement) {
    return;
  }

  const domRange = ReactEditor.resolveDOMRange(editor, range);

  if (!domRange) {
    return;
  }

  const root = editorElement.getRootNode() as Document | ShadowRoot;
  const domSelection = getSelection(root);

  if (!domSelection) {
    return;
  }

  inputController.state.isUpdatingSelection = true;
  inputController.state.selectionChangeOrigin = 'programmatic-export';

  try {
    if (RangeApi.isBackward(range)) {
      domSelection.setBaseAndExtent(
        domRange.endContainer,
        domRange.endOffset,
        domRange.startContainer,
        domRange.startOffset
      );
    } else {
      domSelection.setBaseAndExtent(
        domRange.startContainer,
        domRange.startOffset,
        domRange.endContainer,
        domRange.endOffset
      );
    }
  } catch {
    domSelection.removeAllRanges();
    domSelection.addRange(domRange);
  }

  editorElement.ownerDocument.dispatchEvent(
    new Event('selectionchange', { bubbles: true })
  );
  const rootWindow = getDefaultView(editorElement);
  const resetUpdatingSelection = () => {
    inputController.state.isUpdatingSelection = false;
  };

  if (rootWindow) {
    rootWindow.setTimeout(resetUpdatingSelection);
  } else {
    setTimeout(resetUpdatingSelection);
  }
};
