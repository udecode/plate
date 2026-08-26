import type { BaseEditor } from '@platejs/core';
import {
  type Editor as PliteEditor,
  editorCommands,
  type EditorCoreStateView,
  type EditorExtensionDefinitionInput,
  type Element,
} from '@platejs/plite';

export type TriggerComboboxEditor = Pick<BaseEditor, 'plugin'> & {
  read: Pick<EditorCoreStateView, 'nodes'>;
};

export type TriggerComboboxPluginState = {
  trigger?: readonly string[] | RegExp | string;
  triggerPreviousCharPattern?: RegExp;
  createComboboxInput?: (trigger: string) => Element;
  triggerQuery?: (editor: TriggerComboboxEditor) => boolean;
};

export type TriggerComboboxOptions<
  TEditor extends PliteEditor<any, any> & TriggerComboboxEditor = PliteEditor<
    any,
    any
  > &
    TriggerComboboxEditor,
> = {
  editor: TEditor & Pick<BaseEditor, 'runtime'>;
  getState: () => Readonly<TriggerComboboxPluginState>;
  type: string;
};

export type TriggerComboboxCommands<
  TEditor extends PliteEditor<any, any> = PliteEditor<any, any>,
> = NonNullable<EditorExtensionDefinitionInput<TEditor>['commands']>;

export const triggerCombobox = <
  const TEditor extends PliteEditor<any, any> & TriggerComboboxEditor,
>(
  { handle }: Parameters<TriggerComboboxCommands<TEditor>>[0],
  { editor, getState, type }: TriggerComboboxOptions<TEditor>
): ReturnType<TriggerComboboxCommands<TEditor>> => [
  handle(editorCommands.insertText, ({ input, state }) => {
    const {
      createComboboxInput,
      trigger,
      triggerPreviousCharPattern,
      triggerQuery,
    } = getState();
    const selection = state.selection();

    if (
      input.options?.at ||
      !selection ||
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
    const before = state.points.before(selection);
    const previousChar = before
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
];
