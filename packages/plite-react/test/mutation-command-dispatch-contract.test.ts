import { defineEditorExtension, editorCommands } from '@platejs/plite';
import { replace as editorReplace } from '@platejs/plite/internal';
import {
  applyEditableCommand,
  applyModelOwnedDeleteIntent,
  applyModelOwnedLineBreak,
  applyModelOwnedTextInput,
} from '../src/editable/mutation-controller';
import { createReactEditor } from '../src/plugin/with-react';

const createCommandProbeEditor = () => {
  const seen: string[] = [];
  const editor = createReactEditor({
    extensions: [
      defineEditorExtension({
        commands: [
          editorCommands.delete.handle(({ command, state }) => {
            seen.push(`${command.type}:${command.direction}:${command.unit}`);
            return state.transaction(() => {});
          }),
          editorCommands.deleteFragment.handle(({ command, state }) => {
            seen.push(`${command.type}:${command.direction}`);
            return state.transaction(() => {});
          }),
          editorCommands.insertBreak.handle(({ command, state }) => {
            seen.push(command.type);
            return state.transaction(() => {});
          }),
          editorCommands.insertSoftBreak.handle(({ command, state }) => {
            seen.push(command.type);
            return state.transaction(() => {});
          }),
          editorCommands.insertNodes.handle(({ command, state }) => {
            seen.push(command.type);
            return state.transaction(() => {});
          }),
          editorCommands.insertText.handle(({ command, state }) => {
            seen.push(`${command.type}:${command.text}`);
            return state.transaction(() => {});
          }),
        ],
        name: 'react-host-command-probe',
      }),
    ],
  });

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  return { editor, seen };
};

test('React user actions dispatch through semantic editor commands', () => {
  const { editor, seen } = createCommandProbeEditor();

  applyModelOwnedDeleteIntent({ direction: 'backward', editor, unit: 'word' });
  applyModelOwnedLineBreak({ editor, kind: 'paragraph' });
  applyModelOwnedLineBreak({ editor, kind: 'soft' });
  applyModelOwnedLineBreak({ editor, kind: 'open-line' });
  applyModelOwnedTextInput({
    data: 'x',
    editor,
    inputType: 'insertText',
    selection: editor.read((state) => state.selection()),
  });
  applyEditableCommand({
    command: {
      direction: 'forward',
      kind: 'delete-fragment',
      selection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      },
    },
    editor,
  });

  expect(seen).toEqual([
    'delete:backward:word',
    'insert_break',
    'insert_soft_break',
    'insert_nodes',
    'insert_text:x',
    'delete_fragment:forward',
  ]);
});
