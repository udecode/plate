// Probe: does `history.native-grouping-input` mark typing only, and does it
// carry the mount's input-controller origin? Runs the real Plite input path.
import { createEditor } from '../../../../packages/plitejs/src/index';

import {
  getSelection as editorGetSelection,
  replace as editorReplace,
} from '../../../../packages/plitejs/src/internal';
import {
  createEditableInputController,
  createEditableInputControllerState,
} from '../../../../packages/plitejs/src/react/editable/input-state';
import { applyModelOwnedBeforeInputMutation } from '../../../../packages/plitejs/src/react/editable/model-input-strategy';

import { readTypedInsertion } from '../../../../packages/platejs/src/features/combobox/lib/combobox.internal';

const KEY = 'history.native-grouping-input';

const makeEditor = () => {
  const editor = createEditor();
  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'hi ' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });
  (editor as any).api = {
    ...(editor as any).api,
    dom: {
      ...((editor as any).api?.dom ?? {}),
      clipboard: { insertData: () => true },
    },
  };
  return editor;
};

const controller = () =>
  createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: createEditableInputControllerState(),
  });

const run = (
  label: string,
  inputType: string,
  data: unknown,
  withController: boolean
) => {
  const editor = makeEditor();
  const a = controller();
  const b = controller();
  const commits: any[] = [];
  const stop = editor.subscribeCommit((commit: any) => commits.push(commit));

  applyModelOwnedBeforeInputMutation({
    data,
    editor: editor as any,
    inputController: withController ? a : undefined,
    inputType,
    native: false,
    selection: editorGetSelection(editor),
    setComposing: () => {},
  });
  stop();

  const last = commits.at(-1);
  const stamp = last?.annotations?.[KEY];
  console.log(
    JSON.stringify({
      label,
      inputType,
      commits: commits.length,
      tags: last?.tags ?? null,
      stamp: stamp ?? null,
      builtOwnerAccepts: last ? readTypedInsertion(last) !== null : false,
      originIsA: stamp?.origin === a.nativeHistoryOrigin,
      originIsB: stamp?.origin === b.nativeHistoryOrigin,
      aOrigin: a.nativeHistoryOrigin,
      bOrigin: b.nativeHistoryOrigin,
    })
  );
};

run('typed char', 'insertText', '@', true);
run('string paste (no DataTransfer)', 'insertFromPaste', '@ann', true);
run('yank', 'insertFromYank', '@ann', true);
run('replacement (autocorrect)', 'insertReplacementText', '@Ann', true);
run('drop as string', 'insertFromDrop', '@ann', true);
run('paste with DataTransfer', 'insertFromPaste', { getData: () => '', types: [], files: [], items: [] }, true);
run('typed char, no controller', 'insertText', '@', false);
