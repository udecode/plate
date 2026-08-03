import {
  createEditor,
  type DefinitionOf,
  type Descendant,
  defineExtension,
  type EditorExtensionTypeProvider,
  type Value,
} from '@platejs/plite';
import type { EditorExtensionTypeLambda } from '@platejs/plite/internal';

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

const ChecklistExtension = defineExtension('checklist', {
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

const RuntimeHostExtension = defineExtension('runtime-host', {
  api: () => ({
    status() {
      return 'ready' as const;
    },
  }),
});

const editor = createEditor({
  initialValue,
  extensions: [ChecklistExtension, RuntimeHostExtension] as const,
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
const tokenHostStatus: 'ready' = editor
  .extension(RuntimeHostExtension)
  .api.status();

const OtherRuntimeHostExtension = defineExtension('other-runtime-host', {
  api: () => ({
    status() {
      return 'ready' as const;
    },
  }),
});

type ValueEchoExtensionTypes<V extends Value> = {
  read: {
    valueEcho: {
      value: () => V;
    };
  };
};

interface ValueEchoExtensionTypeLambda extends EditorExtensionTypeLambda {
  readonly output: ValueEchoExtensionTypes<this['input']>;
}

const ValueEchoExtension = defineExtension('value-echo', {}) as ReturnType<
  typeof defineExtension
> &
  EditorExtensionTypeProvider<ValueEchoExtensionTypeLambda> & {
    name: 'value-echo';
  };
const ValueEchoCarrierExtension = defineExtension('value-echo-carrier', {
  dependencies: [ValueEchoExtension],
});
const directValueEchoEditor = createEditor({
  initialValue,
  extensions: [ValueEchoExtension] as const,
});
const transitiveValueEchoEditor = createEditor({
  initialValue,
  extensions: [ValueEchoCarrierExtension] as const,
});
const widenedValueEchoExtensions: readonly (
  | typeof OtherRuntimeHostExtension
  | typeof ValueEchoExtension
)[] = [ValueEchoExtension];
const widenedValueEchoEditor = createEditor({
  initialValue,
  extensions: widenedValueEchoExtensions,
});
type InferredCustomValue = readonly {
  readonly children: readonly {
    readonly checked?: boolean;
    readonly text: string;
  }[];
  readonly type: string;
}[];
const _directValueEcho: InferredCustomValue =
  directValueEchoEditor.read.valueEcho.value();
const _transitiveValueEcho: InferredCustomValue =
  transitiveValueEchoEditor.read.valueEcho.value();
const _widenedValueEcho: InferredCustomValue =
  widenedValueEchoEditor.read.valueEcho.value();

const TransitiveRuntimeHostExtension = defineExtension(
  'transitiveRuntimeHost',
  {
    api: () => ({
      status: () => 'transitive' as const,
    }),
  }
);

const TransitiveConsumerExtension = defineExtension('transitiveConsumer', {
  api({ editor }) {
    const host = editor.extension(TransitiveRuntimeHostExtension).api;

    return {
      status: host.status,
    };
  },
  dependencies: [TransitiveRuntimeHostExtension],
});

const TransitiveRootExtension = defineExtension('transitiveRoot', {
  api({ editor }) {
    return {
      status: editor.extension(TransitiveRuntimeHostExtension).api.status,
    };
  },
  dependencies: [TransitiveConsumerExtension] as const,
});

const transitiveEditor = createEditor({
  extensions: [TransitiveRootExtension] as const,
});
const transitiveHostStatus: 'transitive' = transitiveEditor
  .extension(TransitiveRuntimeHostExtension)
  .api.status();
const transitiveConsumerStatus: 'transitive' = transitiveEditor
  .extension(TransitiveConsumerExtension)
  .api.status();
const transitiveRootStatus: 'transitive' = transitiveEditor
  .extension(TransitiveRootExtension)
  .api.status();

type Equal<TLeft, TRight> =
  (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
type TransitiveConsumerDefinition = DefinitionOf<
  typeof TransitiveConsumerExtension
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
    Extract<keyof typeof TransitiveConsumerExtension, string>,
    'api' | 'dependencies' | 'name'
  >
>;
type RuntimeConsumerDependency =
  (typeof TransitiveConsumerExtension)['dependencies'][number];
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

defineExtension('old-capabilities', {
  // @ts-expect-error public extension authoring uses api, not capabilities
  capabilities: {
    checklist: {
      toggle() {},
    },
  },
});

const DisabledChecklistExtension = defineExtension('checklist', {
  enabled: false,
});

const DisabledRuntimeHostExtension = defineExtension('runtime-host', {
  enabled: false,
});

const DisabledDependencyConsumerExtension = defineExtension(
  'disabled-dependency-consumer',
  {
    api({ editor }) {
      typeOnly(() => {
        // @ts-expect-error disabled dependencies do not provide portals
        editor.extension(DisabledRuntimeHostExtension);
      });

      return {};
    },
    dependencies: [DisabledRuntimeHostExtension],
  }
);

type DisabledDependencyConsumerDefinition = DefinitionOf<
  typeof DisabledDependencyConsumerExtension
>;
type DisabledDependencyDefinition =
  DisabledDependencyConsumerDefinition['dependencies'][number];
type _keepsDisabledDependencyFlag = Expect<
  Equal<DisabledDependencyDefinition['enabled'], false>
>;
type _keepsDisabledRuntimeDependencyFlag = Expect<
  Equal<
    (typeof DisabledDependencyConsumerExtension)['dependencies'][number]['enabled'],
    false
  >
>;

const disabledEditor = createEditor({
  initialValue,
  extensions: [
    ChecklistExtension,
    DisabledChecklistExtension,
    RuntimeHostExtension,
    DisabledRuntimeHostExtension,
  ] as const,
});

typeOnly(() => {
  // @ts-expect-error disabled extensions do not contribute read groups
  disabledEditor.read((state) => state.checklist.isActive());

  // @ts-expect-error disabled extensions do not contribute update groups
  disabledEditor.update((tx) => tx.checklist.toggle());

  // @ts-expect-error disabled extensions do not contribute runtime API handles
  disabledEditor.api.runtimeHost.status();

  // @ts-expect-error disabled extension tokens cannot access installed API
  disabledEditor.extension(RuntimeHostExtension);
});

const DisabledRuntimeHostCarrierExtension = defineExtension(
  'disabled-runtime-host-carrier',
  {
    dependencies: [RuntimeHostExtension, DisabledRuntimeHostExtension],
  }
);
const disabledRuntimeHostDependencyEditor = createEditor({
  initialValue,
  extensions: [DisabledRuntimeHostCarrierExtension] as const,
});

typeOnly(() => {
  // @ts-expect-error a later disabled dependency shadows the enabled descriptor
  disabledRuntimeHostDependencyEditor.api['runtime-host'].status();

  // @ts-expect-error a later disabled dependency removes the enabled portal
  disabledRuntimeHostDependencyEditor.extension(RuntimeHostExtension);
});

const EnabledRuntimeHostCarrierExtension = defineExtension(
  'enabled-runtime-host-carrier',
  {
    dependencies: [DisabledRuntimeHostExtension, RuntimeHostExtension],
  }
);
const enabledRuntimeHostDependencyEditor = createEditor({
  initialValue,
  extensions: [EnabledRuntimeHostCarrierExtension] as const,
});
const _reenabledRuntimeHostStatus: 'ready' =
  enabledRuntimeHostDependencyEditor.api['runtime-host'].status();
const _reenabledRuntimeHostPortalStatus: 'ready' =
  enabledRuntimeHostDependencyEditor
    .extension(RuntimeHostExtension)
    .api.status();

const FirstSameNameExtension = defineExtension('same-name', {
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

const SecondSameNameExtension = defineExtension('same-name', {
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
  extensions: [FirstSameNameExtension, SecondSameNameExtension] as const,
});

latestWinsEditor.api['same-name'].secondOnly();

typeOnly(() => {
  // @ts-expect-error latest same-name extension replaces earlier type output
  latestWinsEditor.api['same-name'].firstOnly();
});

latestWinsEditor.extension(SecondSameNameExtension).api.secondOnly();

typeOnly(() => {
  // @ts-expect-error replaced extension tokens cannot access installed API
  latestWinsEditor.extension(FirstSameNameExtension);
});

const SameNameCarrierExtension = defineExtension('same-name-carrier', {
  dependencies: [FirstSameNameExtension, SecondSameNameExtension],
});
const transitiveLatestWinsEditor = createEditor({
  initialValue,
  extensions: [SameNameCarrierExtension] as const,
});

const _transitiveLatestApi: 'second-api' =
  transitiveLatestWinsEditor.api['same-name'].secondOnly();
const _transitiveLatestRead: 'second-read' =
  transitiveLatestWinsEditor.read['same-name'].secondOnly();
transitiveLatestWinsEditor.update['same-name'].secondOnly();
transitiveLatestWinsEditor.extension(SecondSameNameExtension).api.secondOnly();

typeOnly(() => {
  // @ts-expect-error transitive latest same-name dependency replaces earlier API
  transitiveLatestWinsEditor.api['same-name'].firstOnly();

  // @ts-expect-error transitive latest same-name dependency replaces earlier read
  transitiveLatestWinsEditor.read['same-name'].firstOnly();

  // @ts-expect-error transitive latest same-name dependency replaces earlier update
  transitiveLatestWinsEditor.update['same-name'].firstOnly();

  // @ts-expect-error replaced transitive extension tokens are not installed
  transitiveLatestWinsEditor.extension(FirstSameNameExtension);
});

const plainEditor = createEditor({ initialValue });

typeOnly(() => {
  // @ts-expect-error extension read groups are only present when installed
  plainEditor.read((state) => state.checklist.isActive());

  // @ts-expect-error extension update groups are only present when installed
  plainEditor.update((tx) => tx.checklist.toggle());

  // @ts-expect-error extension api handles are only present when installed
  plainEditor.api.runtimeHost.status();

  // @ts-expect-error capability lookup by string is not public API
  editor.extension('runtime-host');

  // @ts-expect-error uninstalled extension tokens cannot access installed API
  editor.extension(OtherRuntimeHostExtension);
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
