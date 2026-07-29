import type { BaseEditor } from '@platejs/core';
import {
  defineEditorExtension,
  editorCommands,
  type EditorCoreStateView,
  type Element,
} from '@platejs/plite';

type TriggerComboboxEditor = Pick<BaseEditor, 'getType'> & {
  read: Pick<EditorCoreStateView, 'nodes'>;
};

export type TriggerComboboxPluginState = {
  trigger?: readonly string[] | RegExp | string;
  triggerPreviousCharPattern?: RegExp;
  createComboboxInput?: (trigger: string) => Element;
  triggerQuery?: (editor: TriggerComboboxEditor) => boolean;
};

export type TriggerComboboxExtensionOptions = {
  editor: Pick<BaseEditor, 'runtime'> & TriggerComboboxEditor;
  getState: () => Readonly<TriggerComboboxPluginState>;
  name: string;
  type: string;
};

export const createTriggerComboboxExtension = ({
  editor,
  getState,
  name,
  type,
}: TriggerComboboxExtensionOptions) =>
  defineEditorExtension({
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const {
          createComboboxInput,
          trigger,
          triggerPreviousCharPattern,
          triggerQuery,
        } = getState();

        if (
          input.options?.at ||
          !state.selection() ||
          !(trigger instanceof RegExp
            ? trigger.test(input.text)
            : Array.isArray(trigger)
              ? trigger.includes(input.text)
              : input.text === trigger) ||
          (triggerQuery && !triggerQuery(editor))
        ) {
          return false;
        }

        // Make sure an input is created at the beginning of line or after a whitespace
        const selection = state.selection();
        const before = selection && state.points.before(selection);
        const previousChar =
          selection && before
            ? state.text.string({
                anchor: before,
                focus: selection.anchor,
              })
            : '';

        const matchesPreviousCharPattern =
          triggerPreviousCharPattern?.test(previousChar);

        if (matchesPreviousCharPattern) {
          const inputNode: Element = createComboboxInput
            ? createComboboxInput(input.text)
            : { children: [{ text: '' }], type };

          // Only the creator sees the transient input in collaborative editors.
          const node = editor.runtime.userId
            ? { ...inputNode, userId: editor.runtime.userId }
            : inputNode;

          return state.transaction((tx) => {
            tx.nodes.insert(node, input.options);
          });
        }

        return false;
      }),
    ],
    name,
  });
