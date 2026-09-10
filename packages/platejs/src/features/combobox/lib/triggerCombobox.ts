import {
  type Editor,
  type EditorCommandHandler,
  type EditorCommandInput,
  editorCommands,
  type EditorCoreStateView,
  type Element,
  RangeApi,
} from '../../../core';

export type TriggerComboboxEditor = Pick<Editor, 'plugin'> & {
  read: Pick<EditorCoreStateView, 'nodes'>;
};

export type TriggerComboboxPluginState = {
  trigger: readonly string[] | RegExp | string | null;
  triggerPreviousCharPattern: RegExp | null;
  createComboboxInput: ((trigger: string) => Element) | null;
  triggerQuery: ((editor: TriggerComboboxEditor) => boolean) | null;
};

export type TriggerComboboxOptions<
  TEditor extends TriggerComboboxEditor = TriggerComboboxEditor,
> = {
  editor: TEditor & Pick<Editor, 'runtime'>;
  getState: () => Readonly<TriggerComboboxPluginState>;
  type: string;
};

type TriggerComboboxCommandContext = Readonly<{
  handle: (...args: never[]) => unknown;
}>;

export const triggerCombobox = <
  const TContext extends TriggerComboboxCommandContext,
  const TEditor extends TriggerComboboxEditor,
>(
  { handle }: TContext,
  { editor, getState, type }: TriggerComboboxOptions<TEditor>
): ReadonlyArray<ReturnType<TContext['handle']>> => {
  const register = handle as unknown as (
    command: typeof editorCommands.insertText,
    handler: EditorCommandHandler<
      EditorCommandInput<typeof editorCommands.insertText>,
      TEditor
    >
  ) => ReturnType<TContext['handle']>;

  return [
    register(editorCommands.insertText, ({ input, state }) => {
      const {
        createComboboxInput,
        trigger,
        triggerPreviousCharPattern,
        triggerQuery,
      } = getState();
      const explicitTarget = input.options?.at;
      const selection =
        explicitTarget === undefined
          ? state.selection()
          : RangeApi.isRange(explicitTarget)
            ? explicitTarget
            : null;

      if (
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
};
