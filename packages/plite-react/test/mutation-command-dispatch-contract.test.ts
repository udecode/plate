import { defineExtension, editorCommands } from '@platejs/plite';
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
      defineExtension('react-host-command-probe', {
        commands: ({ handle }) => [
          handle(editorCommands.delete, ({ input, state }) => {
            seen.push(
              `${editorCommands.delete.id}:${input.direction}:${input.unit}`
            );
            return state.transaction(() => {});
          }),
          handle(editorCommands.deleteFragment, ({ input, state }) => {
            seen.push(`${editorCommands.deleteFragment.id}:${input.direction}`);
            return state.transaction(() => {});
          }),
          handle(editorCommands.insertBreak, ({ state }) => {
            seen.push(editorCommands.insertBreak.id);
            return state.transaction(() => {});
          }),
          handle(editorCommands.insertSoftBreak, ({ state }) => {
            seen.push(editorCommands.insertSoftBreak.id);
            return state.transaction(() => {});
          }),
          handle(editorCommands.insertNodes, ({ state }) => {
            seen.push(editorCommands.insertNodes.id);
            return state.transaction(() => {});
          }),
          handle(editorCommands.insertText, ({ input }) => {
            seen.push(`${editorCommands.insertText.id}:${input.text}`);
            return false;
          }),
          handle(editorCommands.select, () => {
            seen.push(editorCommands.select.id);
            return false;
          }),
          handle(editorCommands.collapse, () => {
            seen.push(editorCommands.collapse.id);
            return false;
          }),
          handle(editorCommands.move, () => {
            seen.push(editorCommands.move.id);
            return false;
          }),
        ],
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
    'content.delete:backward:word',
    'break.insert',
    'break.insertSoft',
    'node.insert',
    'text.insert:x',
    'fragment.delete:forward',
  ]);
  expect(editor.read.lastCommit()?.tags).toContain('semantic-command');
});

test('React selection actions dispatch through semantic editor commands', () => {
  const { editor, seen } = createCommandProbeEditor();

  applyEditableCommand({
    command: {
      kind: 'select',
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      },
    },
    editor,
  });
  applyEditableCommand({
    command: { axis: 'horizontal', kind: 'move-selection' },
    editor,
  });
  applyEditableCommand({
    command: { axis: 'horizontal', kind: 'move-selection', reverse: true },
    editor,
  });

  expect(seen).toEqual([
    editorCommands.select.id,
    editorCommands.collapse.id,
    editorCommands.move.id,
  ]);
});
