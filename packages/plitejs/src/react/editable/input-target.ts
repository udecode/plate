import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { getSetSite } from '../../core/public-state';
import { getSelectionStateCaret } from '../../core/selection-state';
import { sealsText } from '../../core/set-root';
import { getCaretOwner } from '../../core/view-carets';
import type { InputTarget, OpenedInput } from '../../dom/utils/weak-maps';
import type { AnyEditor as Editor } from '../../interfaces/editor';
import { SelectionApi } from '../../interfaces/selection';
import { readRuntimeSelection } from './runtime-selection-state';

export const openInputTarget = (editor: Editor): OpenedInput => {
  const owner = getEditorRuntimeOwner(editor);
  const caret = getSelectionStateCaret(owner);

  if (sealsText(getSetSite(owner), caret)) return 'sealed';

  return {
    root: caret.root,
    session: caret.session,
    inSetRoot: caret.inSetRoot,
    view: getCaretOwner(owner)?.presentation ?? null,
  } as InputTarget;
};

export const inputTargetLive = (editor: Editor, target: OpenedInput) => {
  if (target === 'sealed') return false;
  const owner = getEditorRuntimeOwner(editor);
  const caret = getSelectionStateCaret(owner);

  if (sealsText(getSetSite(owner), caret)) return false;
  if (!target.inSetRoot) return true;

  return (
    caret.root === target.root &&
    caret.session === target.session &&
    (getCaretOwner(owner)?.presentation ?? null) === target.view
  );
};

export const textSealedElsewhere = (editor: Editor) =>
  !SelectionApi.isNode(readRuntimeSelection(editor)) &&
  openInputTarget(editor) === 'sealed';
