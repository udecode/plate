import {
  createEditor,
  type DefinitionOf,
  type Descendant,
  definePlugin,
  type PluginTypeProvider,
  type Value,
} from 'plitejs';

import type { PluginTypeLambda } from '../src/internal';

type CustomText = {
  text: string;
  checked?: true;
};

type ChecklistElement = {
  type: 'checklist';
  children: CustomText[];
};

type CustomValue = readonly ChecklistElement[];

const typeOnly = (_callback: () => void) => {};

const initialValue: CustomValue = [
  { type: 'checklist', children: [{ text: 'todo' }] },
];

const ChecklistPlugin = definePlugin('checklist', {
  read: ({ state }) => ({
    isActive: () => state.selection() != null,
    value: () => state.children() as CustomValue,
  }),
  update: ({ tx }) => ({
    toggle() {
      tx.nodes.set({ checked: true }, { at: [0, 0] });
    },
    value: () => tx.children() as CustomValue,
  }),
});

const RuntimeHostPlugin = definePlugin('runtime-host', {
  api: () => ({
    status() {
      return 'ready' as const;
    },
  }),
});

const editor = createEditor({
  initialValue,
  plugins: [ChecklistPlugin, RuntimeHostPlugin] as const,
});

const installedValue: CustomValue = editor.read((state) =>
  state.checklist.value()
);
const installedActive: boolean = editor.read((state) =>
  state.checklist.isActive()
);
const directInstalledValue: CustomValue = editor.read.checklist.value();
const directInstalledActive: boolean = editor.read.checklist.isActive();

editor.update((tx) => {
  const value: CustomValue = tx.checklist.value();
  tx.checklist.toggle();

  void value;
});
editor.update.checklist.toggle();

const hostStatus: 'ready' = editor.api['runtime-host'].status();
const tokenHostStatus: 'ready' = editor.plugin(RuntimeHostPlugin).api.status();

const OtherRuntimeHostPlugin = definePlugin('other-runtime-host', {
  api: () => ({
    status() {
      return 'ready' as const;
    },
  }),
});

type ValueEchoPluginTypes<V extends Value> = {
  read: {
    valueEcho: {
      value: () => V;
    };
  };
};

interface ValueEchoPluginTypeLambda extends PluginTypeLambda {
  readonly output: ValueEchoPluginTypes<this['input']>;
}

const BaseValueEchoPlugin = definePlugin('value-echo', {});
const ValueEchoPlugin = BaseValueEchoPlugin as typeof BaseValueEchoPlugin &
  PluginTypeProvider<ValueEchoPluginTypeLambda> & {
    name: 'value-echo';
  };
const ValueEchoCarrierPlugin = definePlugin('value-echo-carrier', {
  dependencies: [ValueEchoPlugin],
});
const directValueEchoEditor = createEditor({
  initialValue,
  plugins: [ValueEchoPlugin] as const,
});
const transitiveValueEchoEditor = createEditor({
  initialValue,
  plugins: [ValueEchoCarrierPlugin] as const,
});
const widenedValueEchoPlugins: ReadonlyArray<
  typeof OtherRuntimeHostPlugin | typeof ValueEchoPlugin
> = [ValueEchoPlugin];
const widenedValueEchoEditor = createEditor({
  initialValue,
  plugins: widenedValueEchoPlugins,
});
type InferredCustomValue = ReadonlyArray<{
  readonly children: ReadonlyArray<{
    readonly checked?: boolean;
    readonly text: string;
  }>;
  readonly type: string;
}>;
const _directValueEcho: InferredCustomValue =
  directValueEchoEditor.read.valueEcho.value();
const _transitiveValueEcho: InferredCustomValue =
  transitiveValueEchoEditor.read.valueEcho.value();
const _widenedValueEcho: InferredCustomValue =
  widenedValueEchoEditor.read.valueEcho.value();

const TransitiveRuntimeHostPlugin = definePlugin('transitiveRuntimeHost', {
  api: () => ({
    status: () => 'transitive' as const,
  }),
});

const TransitiveConsumerPlugin = definePlugin('transitiveConsumer', {
  api({ editor: innerEditor }) {
    const host = innerEditor.plugin(TransitiveRuntimeHostPlugin).api;

    return {
      status: host.status,
    };
  },
  dependencies: [TransitiveRuntimeHostPlugin],
});

const TransitiveRootPlugin = definePlugin('transitiveRoot', {
  api({ editor: innerEditor2 }) {
    return {
      status: innerEditor2.plugin(TransitiveRuntimeHostPlugin).api.status,
    };
  },
  dependencies: [TransitiveConsumerPlugin] as const,
});

const transitiveEditor = createEditor({
  plugins: [TransitiveRootPlugin] as const,
});
const transitiveHostStatus: 'transitive' = transitiveEditor
  .plugin(TransitiveRuntimeHostPlugin)
  .api.status();
const transitiveConsumerStatus: 'transitive' = transitiveEditor
  .plugin(TransitiveConsumerPlugin)
  .api.status();
const transitiveRootStatus: 'transitive' = transitiveEditor
  .plugin(TransitiveRootPlugin)
  .api.status();

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
type TransitiveConsumerDefinition = DefinitionOf<
  typeof TransitiveConsumerPlugin
>;
type ConsumerDependencies = NonNullable<
  TransitiveConsumerDefinition['dependencies']
>;
type ConsumerDependency = ConsumerDependencies[number];
type _keepsPublicDependenciesShallow = Expect<
  Equal<
    Extract<keyof ConsumerDependency, 'api' | 'read' | 'schema' | 'update'>,
    never
  >
>;
type _keepsPublicDependencyName = Expect<
  Equal<ConsumerDependency['name'], 'transitiveRuntimeHost'>
>;
type _keepsPublicDependencyTuple = Expect<
  Equal<ConsumerDependencies['length'], 1>
>;
type _keepsDefinitionFieldsFlat = Expect<
  Equal<
    Extract<keyof TransitiveConsumerDefinition, string>,
    'api' | 'dependencies' | 'name'
  >
>;
type _keepsApiOutputInsteadOfFactory = Expect<
  Equal<
    TransitiveConsumerDefinition['api'] extends (...args: never[]) => unknown
      ? true
      : false,
    false
  >
>;
type _keepsDescriptorWitnessOutOfStringKeys = Expect<
  Equal<
    Extract<keyof typeof TransitiveConsumerPlugin, string>,
    'api' | 'dependencies' | 'name'
  >
>;
type RuntimeConsumerDependency =
  (typeof TransitiveConsumerPlugin)['dependencies'][number];
type _keepsRuntimeDependenciesShallow = Expect<
  Equal<
    Extract<
      keyof RuntimeConsumerDependency,
      'api' | 'read' | 'schema' | 'update'
    >,
    never
  >
>;
type _keepsRuntimeDependencyName = Expect<
  Equal<RuntimeConsumerDependency['name'], 'transitiveRuntimeHost'>
>;

definePlugin('old-capabilities', {
  // @ts-expect-error public plugin authoring uses api, not capabilities
  capabilities: {
    checklist: {
      toggle() {},
    },
  },
});

const DisabledChecklistPlugin = definePlugin('checklist', {
  enabled: false,
});

const DisabledRuntimeHostPlugin = definePlugin('runtime-host', {
  enabled: false,
});

const DisabledDependencyConsumerPlugin = definePlugin(
  'disabled-dependency-consumer',
  {
    api({ editor: innerEditor3 }) {
      typeOnly(() => {
        const { installed } = innerEditor3.plugin(DisabledRuntimeHostPlugin);
        void (installed satisfies boolean);
      });

      return {};
    },
    dependencies: [DisabledRuntimeHostPlugin],
  }
);

type DisabledDependencyConsumerDefinition = DefinitionOf<
  typeof DisabledDependencyConsumerPlugin
>;
type DisabledDependencyDefinition =
  DisabledDependencyConsumerDefinition['dependencies'][number];
type _keepsDisabledDependencyFlag = Expect<
  Equal<DisabledDependencyDefinition['enabled'], false>
>;
type _keepsDisabledRuntimeDependencyFlag = Expect<
  Equal<
    (typeof DisabledDependencyConsumerPlugin)['dependencies'][number]['enabled'],
    false
  >
>;

const disabledEditor = createEditor({
  initialValue,
  plugins: [
    ChecklistPlugin,
    DisabledChecklistPlugin,
    RuntimeHostPlugin,
    DisabledRuntimeHostPlugin,
  ] as const,
});

typeOnly(() => {
  // @ts-expect-error disabled plugins do not contribute read groups
  disabledEditor.read((state) => state.checklist.isActive());

  // @ts-expect-error disabled plugins do not contribute update groups
  disabledEditor.update((tx) => tx.checklist.toggle());

  // @ts-expect-error disabled plugins do not contribute runtime API handles
  disabledEditor.api.runtimeHost.status();

  const disabledRuntimeHostInstalled =
    disabledEditor.plugin(RuntimeHostPlugin).installed;
  void (disabledRuntimeHostInstalled satisfies boolean);
});

const DisabledRuntimeHostCarrierPlugin = definePlugin(
  'disabled-runtime-host-carrier',
  {
    dependencies: [RuntimeHostPlugin, DisabledRuntimeHostPlugin],
  }
);
const disabledRuntimeHostDependencyEditor = createEditor({
  initialValue,
  plugins: [DisabledRuntimeHostCarrierPlugin] as const,
});

typeOnly(() => {
  // @ts-expect-error a later disabled dependency shadows the enabled descriptor
  disabledRuntimeHostDependencyEditor.api['runtime-host'].status();

  const disabledDependencyInstalled =
    disabledRuntimeHostDependencyEditor.plugin(RuntimeHostPlugin).installed;
  void (disabledDependencyInstalled satisfies boolean);
});

const EnabledRuntimeHostCarrierPlugin = definePlugin(
  'enabled-runtime-host-carrier',
  {
    dependencies: [DisabledRuntimeHostPlugin, RuntimeHostPlugin],
  }
);
const enabledRuntimeHostDependencyEditor = createEditor({
  initialValue,
  plugins: [EnabledRuntimeHostCarrierPlugin] as const,
});
const _reenabledRuntimeHostStatus: 'ready' =
  enabledRuntimeHostDependencyEditor.api['runtime-host'].status();
const _reenabledRuntimeHostPortalStatus: 'ready' =
  enabledRuntimeHostDependencyEditor.plugin(RuntimeHostPlugin).api.status();

const FirstSameNamePlugin = definePlugin('same-name', {
  api: () => ({
    firstOnly: () => 'first-api' as const,
  }),
  read: () => ({
    firstOnly: () => 'first-read' as const,
  }),
  update: () => ({
    firstOnly() {},
  }),
});

const SecondSameNamePlugin = definePlugin('same-name', {
  api: () => ({
    secondOnly: () => 'second-api' as const,
  }),
  read: () => ({
    secondOnly: () => 'second-read' as const,
  }),
  update: () => ({
    secondOnly() {},
  }),
});

const latestWinsEditor = createEditor({
  initialValue,
  plugins: [FirstSameNamePlugin, SecondSameNamePlugin] as const,
});

latestWinsEditor.api['same-name'].secondOnly();

typeOnly(() => {
  // @ts-expect-error latest same-name plugin replaces earlier type output
  latestWinsEditor.api['same-name'].firstOnly();
});

latestWinsEditor.plugin(SecondSameNamePlugin).api.secondOnly();

typeOnly(() => {
  const firstSameNameInstalled =
    latestWinsEditor.plugin(FirstSameNamePlugin).installed;
  void (firstSameNameInstalled satisfies boolean);
});

const SameNameCarrierPlugin = definePlugin('same-name-carrier', {
  dependencies: [FirstSameNamePlugin, SecondSameNamePlugin],
});
const transitiveLatestWinsEditor = createEditor({
  initialValue,
  plugins: [SameNameCarrierPlugin] as const,
});

const _transitiveLatestApi: 'second-api' =
  transitiveLatestWinsEditor.api['same-name'].secondOnly();
const _transitiveLatestRead: 'second-read' =
  transitiveLatestWinsEditor.read['same-name'].secondOnly();
transitiveLatestWinsEditor.update['same-name'].secondOnly();
transitiveLatestWinsEditor.plugin(SecondSameNamePlugin).api.secondOnly();

typeOnly(() => {
  // @ts-expect-error transitive latest same-name dependency replaces earlier API
  transitiveLatestWinsEditor.api['same-name'].firstOnly();

  // @ts-expect-error transitive latest same-name dependency replaces earlier read
  transitiveLatestWinsEditor.read['same-name'].firstOnly();

  // @ts-expect-error transitive latest same-name dependency replaces earlier update
  transitiveLatestWinsEditor.update['same-name'].firstOnly();

  const firstTransitiveInstalled =
    transitiveLatestWinsEditor.plugin(FirstSameNamePlugin).installed;
  void (firstTransitiveInstalled satisfies boolean);
});

const plainEditor = createEditor({ initialValue });

typeOnly(() => {
  // @ts-expect-error plugin read groups are only present when installed
  plainEditor.read((state) => state.checklist.isActive());

  // @ts-expect-error plugin update groups are only present when installed
  plainEditor.update((tx) => tx.checklist.toggle());

  // @ts-expect-error plugin api handles are only present when installed
  plainEditor.api.runtimeHost.status();

  // @ts-expect-error capability lookup by string is not public API
  editor.plugin('runtime-host');

  const otherRuntimeHostInstalled = editor.plugin(
    OtherRuntimeHostPlugin
  ).installed;
  void (otherRuntimeHostInstalled satisfies boolean);
});

const _keepsValueInference: Descendant = installedValue[0];
const _keepsBooleanInference: boolean = installedActive;
const _keepsDirectValueInference: Descendant = directInstalledValue[0];
const _keepsDirectBooleanInference: boolean = directInstalledActive;
const _keepsHostStatusInference: 'ready' = hostStatus;
const _keepsTokenHostStatusInference: 'ready' = tokenHostStatus;
const _keepsTransitiveHostInference: 'transitive' = transitiveHostStatus;
const _keepsTransitiveConsumerInference: 'transitive' =
  transitiveConsumerStatus;
const _keepsTransitiveRootInference: 'transitive' = transitiveRootStatus;
