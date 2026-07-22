import {
  defineCommand,
  defineEditorExtension,
  txOnly,
  type Editor,
  type Value,
} from '@platejs/plite';

const SpecialExtension = defineEditorExtension({
  name: 'special',
  state: { special: () => ({ value: () => 1 }) },
  tx: {
    special: () => ({
      unsafe: txOnly(() => {}),
      value: () => 1,
    }),
  },
});
const ExtraExtension = defineEditorExtension({
  name: 'extra',
  state: { extra: () => ({ value: () => 2 }) },
});

type PlainEditor = Editor<Value>;
type SpecialEditor = Editor<Value, readonly [typeof SpecialExtension]>;
type SpecialExtraEditor = Editor<
  Value,
  readonly [typeof SpecialExtension, typeof ExtraExtension]
>;

const specialCommand = defineCommand<{ amount: number }, SpecialEditor>(
  'test.special',
  {
    build: ({ input, state }) => {
      state.special.value();

      return input.amount > 0
        ? state.transaction((tx) => {
            tx.special.value();
            // @ts-expect-error txOnly methods are unavailable in pure specs
            tx.special.unsafe();
          })
        : false;
    },
  }
);
const specialExtraCommand = defineCommand<void, SpecialExtraEditor>(
  'test.special-extra',
  {
    build: ({ state }) => {
      state.special.value();
      state.extra.value();

      return false;
    },
  }
);

declare const plain: PlainEditor;
declare const special: SpecialEditor;
declare const specialExtra: SpecialExtraEditor;

special.update.command(specialCommand, { amount: 1 });
// @ts-expect-error missing payload
special.update.command(specialCommand);
// @ts-expect-error wrong payload
special.update.command(specialCommand, { amount: '1' });

specialExtra.update.command(specialCommand, { amount: 1 });
// @ts-expect-error plain lacks SpecialExtension
plain.update.command(specialCommand, { amount: 1 });
// @ts-expect-error SpecialEditor lacks ExtraExtension
special.update.command(specialExtraCommand);

defineEditorExtension<SpecialEditor>()({
  commands: ({ handle }) => [
    handle(specialCommand, ({ state }) => {
      state.special.value();

      return state.transaction((tx) => {
        tx.special.value();
      });
    }),
  ],
  name: 'special-handler',
});
defineEditorExtension<SpecialExtraEditor>()({
  commands: ({ handle }) => [
    handle(specialCommand, ({ state }) => {
      state.special.value();
      state.extra.value();

      return false;
    }),
    handle(specialExtraCommand, ({ state }) => {
      state.special.value();
      state.extra.value();

      return false;
    }),
  ],
  name: 'special-extra-handler',
});
defineEditorExtension<SpecialEditor>()({
  commands: ({ handle }) => [
    // @ts-expect-error command requires ExtraExtension
    handle(specialExtraCommand, () => false),
  ],
  name: 'bad-special-extra-handler',
});
defineEditorExtension<PlainEditor>()({
  commands: ({ handle }) => [
    // @ts-expect-error command requires SpecialExtension
    handle(specialCommand, () => false),
  ],
  name: 'bad-special-handler',
});
