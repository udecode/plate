import {
  defineCommand,
  definePlugin,
  txOnly,
  type Editor,
  type EditorTransactionSpecBuilder,
  type NodeKey,
  type Value,
} from 'plitejs';

const SpecialPlugin = definePlugin('special', {
  read: () => ({ value: () => 1 }),
  update: () => ({
    unsafe: txOnly(() => {}),
    value: () => 1,
  }),
});
const NestedPlugin = definePlugin('nested', {
  update: () => ({ inner: { value: () => 1 } }),
});
const ExtraPlugin = definePlugin('extra', {
  read: () => ({ value: () => 2 }),
});

type PlainEditor = Editor<Value>;
type HostOnlyValue = Array<{
  type: 'host-only';
  children: Array<{ text: string }>;
}>;
type SpecialEditor = Editor<Value, readonly [typeof SpecialPlugin]>;
type NestedEditor = Editor<Value, readonly [typeof NestedPlugin]>;
type SpecialExtraEditor = Editor<
  Value,
  readonly [typeof SpecialPlugin, typeof ExtraPlugin]
>;

const specialCommand = defineCommand<{ amount: number }, SpecialEditor>(
  'test.special',
  {
    build: ({ input, state }) => {
      state.special.value();

      return input.amount > 0
        ? state.transaction((tx) => {
            const value: number = tx.special.value();

            void value;
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
declare const nested: NestedEditor;

special.update.command(specialCommand, { amount: 1 });
// @ts-expect-error missing payload
special.update.command(specialCommand);
// @ts-expect-error wrong payload
special.update.command(specialCommand, { amount: '1' });

specialExtra.update.command(specialCommand, { amount: 1 });

const dispatched: boolean | undefined = special.update.command(specialCommand, {
  amount: 1,
});
// @ts-expect-error a direct command answers undefined when refused
const dispatchedLanded: boolean = special.update.command(specialCommand, {
  amount: 1,
});
const directValue: number | undefined = special.update.special.value();
// @ts-expect-error a direct plugin method answers undefined when refused
const directLanded: number = special.update.special.value();
const sliced: boolean | undefined = plain.update.slice.replace(
  {} as Parameters<PlainEditor['update']['slice']['replace']>[0]
);
// @ts-expect-error a direct slice replace answers undefined when refused
const slicedLanded: boolean = plain.update.slice.replace(
  {} as Parameters<PlainEditor['update']['slice']['replace']>[0]
);
const nestedValue: number | undefined = nested.update.nested.inner.value();
// @ts-expect-error a nested direct plugin method answers undefined when refused
const nestedLanded: number = nested.update.nested.inner.value();
const answered: number | undefined = special.update(() => 1);
// @ts-expect-error an update answers undefined when refused
const answeredLanded: number = special.update(() => 1);
special.update((tx) => {
  const command: boolean = tx.command(specialCommand, { amount: 1 });
  const value: number = tx.special.value();
  const replaced: boolean = tx.slice.replace(
    {} as Parameters<PlainEditor['update']['slice']['replace']>[0]
  );

  void command;
  void value;
  void replaced;
});
void dispatched;
void dispatchedLanded;
void directValue;
void directLanded;
void sliced;
void slicedLanded;
void nestedValue;
void nestedLanded;
void answered;
void answeredLanded;
// @ts-expect-error plain lacks SpecialPlugin
plain.update.command(specialCommand, { amount: 1 });
// @ts-expect-error SpecialEditor lacks ExtraPlugin
special.update.command(specialExtraCommand);

definePlugin('host-agnostic-handler', {
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
definePlugin('special-handler', {
  commands: ({ handle }) => [
    handle(specialCommand, ({ state }) => {
      state.special.value();

      return state.transaction((tx) => {
        tx.special.value();
        const first: NodeKey | null = tx.key([0]);
        // @ts-expect-error pure specs do not expose the plugins group
        void tx.plugins;

        void first;
      });
    }),
  ],
  dependencies: [SpecialPlugin],
});
definePlugin('special-extra-handler', {
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
  dependencies: [SpecialPlugin, ExtraPlugin],
});
definePlugin('bad-special-extra-handler', {
  commands: ({ handle }) => [
    // @ts-expect-error command requires ExtraPlugin
    handle(specialExtraCommand, () => false),
  ],
  dependencies: [SpecialPlugin],
});
definePlugin('bad-special-handler', {
  commands: ({ handle }) => [
    // @ts-expect-error command requires SpecialPlugin
    handle(specialCommand, () => false),
  ],
});
