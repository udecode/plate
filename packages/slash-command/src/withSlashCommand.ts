import { comboboxActions } from '@udecode/plate-combobox';
import {
  getEditorString,
  getNodeString,
  getPlugin,
  getPointBefore,
  getRange,
  moveSelection,
  PlateEditor,
  setSelection,
  TNode,
  TText,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { Range } from 'slate';

import { ELEMENT_SLASH_INPUT } from './createSlashPlugin';
import {
  findSlashInput,
  isNodeSlashInput,
  isSelectionInSlashInput,
} from './queries/index';
import { removeSlashInput } from './transforms';
import { SlashPlugin, TSlashInputElement } from './types';

export const withSlashCommand = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  {
    options: { id, trigger, triggerPreviousCharPattern, query, inputCreation },
  }: WithPlatePlugin<SlashPlugin, V, E>
) => {
  const { type } = getPlugin<{}, V>(editor, ELEMENT_SLASH_INPUT);

  const {
    apply,
    insertBreak,
    insertText,
    deleteBackward,
    insertFragment,
    insertTextData,
    insertNode,
  } = editor;

  const stripNewLineAndTrim: (text: string) => string = (text) => {
    return text
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .join('');
  };

  editor.insertFragment = (fragment) => {
    const inSlashInput = findSlashInput(editor) !== undefined;
    if (!inSlashInput) {
      return insertFragment(fragment);
    }

    return insertText(
      fragment.map((node) => stripNewLineAndTrim(getNodeString(node))).join('')
    );
  };

  editor.insertTextData = (data) => {
    const inSlashInput = findSlashInput(editor) !== undefined;
    if (!inSlashInput) {
      return insertTextData(data);
    }

    const text = data.getData('text/plain');
    if (!text) {
      return false;
    }

    editor.insertText(stripNewLineAndTrim(text));

    return true;
  };

  editor.deleteBackward = (unit) => {
    const currentSlashInput = findSlashInput(editor);
    if (currentSlashInput && getNodeString(currentSlashInput[0]) === '') {
      removeSlashInput(editor, currentSlashInput[1]);
      return moveSelection(editor, { unit: 'word' });
    }

    deleteBackward(unit);
  };

  editor.insertBreak = () => {
    if (isSelectionInSlashInput(editor)) {
      return;
    }

    insertBreak();
  };

  editor.insertText = (text) => {
    if (
      !editor.selection ||
      text !== trigger ||
      (query && !query(editor as PlateEditor)) ||
      isSelectionInSlashInput(editor)
    ) {
      return insertText(text);
    }

    // Make sure a slash input is created at the beginning of line or after a whitespace
    const previousChar = getEditorString(
      editor,
      getRange(
        editor,
        editor.selection,
        getPointBefore(editor, editor.selection)
      )
    );
    const matchesPreviousCharPattern =
      triggerPreviousCharPattern?.test(previousChar);

    if (matchesPreviousCharPattern && text === trigger) {
      const data: TSlashInputElement = {
        type,
        children: [{ text: '' }],
        trigger,
      };
      if (inputCreation) {
        data[inputCreation.key] = inputCreation.value;
      }
      return insertNode(data);
    }

    return insertText(text);
  };

  editor.apply = (operation) => {
    apply(operation);

    if (operation.type === 'insert_text' || operation.type === 'remove_text') {
      const currentSlashInput = findSlashInput(editor);
      if (currentSlashInput) {
        comboboxActions.text(getNodeString(currentSlashInput[0]));
      }
    } else if (operation.type === 'set_selection') {
      const previousSlashInputPath = Range.isRange(operation.properties)
        ? findSlashInput(editor, {
            at: operation.properties,
          })?.[1]
        : undefined;

      const currentSlashInputPath = Range.isRange(operation.newProperties)
        ? findSlashInput(editor, {
            at: operation.newProperties,
          })?.[1]
        : undefined;

      if (previousSlashInputPath && !currentSlashInputPath) {
        removeSlashInput(editor, previousSlashInputPath);
        moveSelection(editor, { unit: 'word' });
      }

      if (currentSlashInputPath) {
        comboboxActions.targetRange(editor.selection);
      }
    } else if (
      operation.type === 'insert_node' &&
      isNodeSlashInput(editor, operation.node as TNode)
    ) {
      if ((operation.node as TSlashInputElement).trigger !== trigger) {
        return;
      }

      const text =
        ((operation.node as TSlashInputElement).children as TText[])[0]?.text ??
        '';

      if (
        inputCreation === undefined ||
        operation.node[inputCreation.key] === inputCreation.value
      ) {
        // Needed for undo - after an undo a slash insert we only receive
        // an insert_node with the slash input, i.e. nothing indicating that it
        // was an undo.
        setSelection(editor, {
          anchor: { path: operation.path.concat([0]), offset: text.length },
          focus: { path: operation.path.concat([0]), offset: text.length },
        });

        comboboxActions.open({
          activeId: id!,
          text,
          targetRange: editor.selection,
        });
      }
    } else if (
      operation.type === 'remove_node' &&
      isNodeSlashInput(editor, operation.node as TNode)
    ) {
      if ((operation.node as TSlashInputElement).trigger !== trigger) {
        return;
      }
      comboboxActions.reset();
    }
  };

  return editor;
};
