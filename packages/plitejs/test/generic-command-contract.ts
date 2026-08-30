import {
  defineCommand,
  defineExtension,
  txOnly,
  type Editor,
  type EditorTransactionSpecBuilder,
  type Value,
} from 'plitejs';

const SpecialExtension = defineExtension('special', {
  read: () => ({ value: () => 1 }),
  update: () => ({
    unsafe: txOnly(() => {}),
    value: () => 1,
  }),
});
const ExtraExtension = defineExtension('extra', {
  read: () => ({ value: () => 2 }),
});

type PlainEditor = Editor<Value>;
type HostOnlyValue = Array<{
  type: 'host-only';
  children: Array<{ text: string }>;
}>;
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
const hostAgnosticCommand = defineCommand('test.host-agnostic');

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

defineExtension('host-agnostic-handler', {
  commands: ({ handle }) => [
    handle(hostAgnosticCommand, ({ state }) =>
      state.transaction((tx) => {
        // @ts-expect-error host-agnostic descriptors cannot assume app-only nodes
        const hostTransaction: EditorTransactionSpecBuilder<HostOnlyValue> = tx;

        void hostTransaction;
      })
    ),
  ],
});
defineExtension('special-handler', {
  commands: ({ handle }) => [
    handle(specialCommand, ({ state }) => {
      state.special.value();

      return state.transaction((tx) => {
        tx.special.value();
      });
    }),
  ],
  dependencies: [SpecialExtension],
});
defineExtension('special-extra-handler', {
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
  dependencies: [SpecialExtension, ExtraExtension],
});
defineExtension('bad-special-extra-handler', {
  commands: ({ handle }) => [
    // @ts-expect-error command requires ExtraExtension
    handle(specialExtraCommand, () => false),
  ],
  dependencies: [SpecialExtension],
});
defineExtension('bad-special-handler', {
  commands: ({ handle }) => [
    // @ts-expect-error command requires SpecialExtension
    handle(specialCommand, () => false),
  ],
});
